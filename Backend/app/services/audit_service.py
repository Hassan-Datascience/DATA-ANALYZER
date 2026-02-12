from datetime import datetime
from typing import Optional

import logging
from bson import ObjectId

from app.ai_modules.anomalies import AnomalyDetector
from app.ai_modules.consistency import ConsistencyChecker
from app.ai_modules.duplicates import DuplicateDetector
from app.ai_modules.inconsistencies import InconsistencyDetector
from app.ai_modules.profiling import ColumnProfiler
from app.ai_modules.scoring import compute_reliability_score
from app.core.exceptions import InvalidDatasetStateError
from app.models.dataset import Dataset
from app.repositories.audit_report_repository import AuditReportRepository
from app.repositories.column_profile_repository import ColumnProfileRepository
from app.repositories.dataset_repository import DatasetRepository
from app.schemas.dataset import DatasetStatusResponse
from app.schemas.report import AuditReportResponse, ColumnProfileSchema
from app.services.data_processing_service import DataProcessor


logger = logging.getLogger(__name__)


class AuditService:
    """
    Service orchestrating the full audit pipeline for a dataset.
    """

    def __init__(
        self,
        dataset_repo: DatasetRepository,
        column_repo: ColumnProfileRepository,
        report_repo: AuditReportRepository,
    ) -> None:
        self._dataset_repo = dataset_repo
        self._column_repo = column_repo
        self._report_repo = report_repo

    async def run_audit(self, dataset_id: str) -> None:
        """
        Execute the audit pipeline for a dataset.
        """
        dataset = await self._dataset_repo.get_by_id(dataset_id)
        if dataset is None:
            logger.warning("Audit requested for missing dataset_id=%s", dataset_id)
            return

        if dataset.status == "processing":
            # Prevent concurrent audits for the same dataset.
            logger.info(
                "Concurrent audit prevented dataset_id=%s current_status=%s",
                dataset_id,
                dataset.status,
            )
            raise InvalidDatasetStateError("Audit already running for this dataset")

        # Mark as processing
        await self._dataset_repo.update_status(dataset_id, "processing")
        logger.info("Audit started dataset_id=%s status=processing", dataset_id)

        profiler = ColumnProfiler()
        inconsistency_detector = InconsistencyDetector()
        consistency_checker = ConsistencyChecker()
        duplicate_detector = DuplicateDetector()
        anomaly_detector = AnomalyDetector()

        processor = DataProcessor(dataset.storage_path)

        try:
            total_rows = 0
            columns_count = 0

            logger.info(
                "Audit processing started dataset_id=%s file_path=%s",
                dataset_id,
                dataset.storage_path,
            )

            for chunk in processor.iter_chunks():
                profiler.process_chunk(chunk)
                inconsistency_detector.process_chunk(chunk)
                consistency_checker.process_chunk(chunk)
                duplicate_detector.process_chunk(chunk)
                anomaly_detector.process_chunk_for_sampling(chunk)

            profiles, total_rows = profiler.build_profiles()
            columns_count = len(profiles)
            logger.info(
                "Profiling completed dataset_id=%s total_rows=%d columns=%d",
                dataset_id,
                total_rows,
                columns_count,
            )

            inconsistency_issues = inconsistency_detector.evaluate(profiles)
            consistency_issues = consistency_checker.evaluate(profiles)
            # Merge consistency issues into inconsistency issues so that
            # downstream scoring and storage see a unified view.
            for col, msgs in consistency_issues.items():
                existing = inconsistency_issues.get(col, [])
                inconsistency_issues[col] = existing + msgs
            logger.info(
                "Inconsistency detection completed dataset_id=%s columns_with_issues=%d",
                dataset_id,
                len(inconsistency_issues),
            )

            duplicate_stats = duplicate_detector.get_stats()
            logger.info(
                "Duplicate detection completed dataset_id=%s duplicates=%d ratio=%.6f",
                dataset_id,
                int(duplicate_stats.get("duplicate_count", 0)),
                float(duplicate_stats.get("duplicate_ratio", 0.0)),
            )

            anomaly_stats = anomaly_detector.compute_anomalies()
            sample_size = int(anomaly_stats.get("sample_size", 0))
            is_sampled = bool(total_rows and sample_size and total_rows > sample_size)
            logger.info(
                "Anomaly detection completed dataset_id=%s anomalies=%d ratio=%.6f sample_size=%d is_sampled=%s",
                dataset_id,
                int(anomaly_stats.get("anomaly_count", 0)),
                float(anomaly_stats.get("anomaly_ratio", 0.0)),
                sample_size,
                is_sampled,
            )

            score, status, issue_summary = compute_reliability_score(
                profiles=profiles,
                inconsistency_issues=inconsistency_issues,
                anomaly_stats=anomaly_stats,
                duplicate_stats=duplicate_stats,
            )
            logger.info(
                "Scoring completed dataset_id=%s reliability_score=%.2f status=%s",
                dataset_id,
                score,
                status,
            )

            await self._column_repo.replace_for_dataset(
                dataset_id=dataset_id,
                profiles=profiles,
                issues=inconsistency_issues,
            )
            logger.info(
                "Column profiles persisted dataset_id=%s column_count=%d",
                dataset_id,
                columns_count,
            )

            recommendations = _build_recommendations(
                profiles, inconsistency_issues, anomaly_stats, duplicate_stats
            )

            await self._report_repo.upsert_report(
                dataset_id=dataset_id,
                reliability_score=score,
                status=status,
                issue_summary=issue_summary,
                anomaly_count=int(anomaly_stats.get("anomaly_count", 0)),
                duplicate_count=int(duplicate_stats.get("duplicate_count", 0)),
                recommendations=recommendations,
                error_message=None,
                is_sampled=is_sampled,
                sample_size=sample_size,
            )
            logger.info("Audit report persisted dataset_id=%s", dataset_id)

            await self._dataset_repo.update_stats(
                dataset_id=dataset_id,
                rows=total_rows,
                columns=columns_count,
            )
            logger.info(
                "Audit completed dataset_id=%s final_status=completed rows=%d columns=%d",
                dataset_id,
                total_rows,
                columns_count,
            )
        except Exception as exc:
            error_message = f"{type(exc).__name__}: {str(exc)}"
            logger.exception(
                "Audit failed dataset_id=%s error=%s",
                dataset_id,
                error_message,
            )
            try:
                await self._dataset_repo.update_status(dataset_id, "failed")
                # Persist a failed audit report with the error message for visibility.
                await self._report_repo.upsert_report(
                    dataset_id=dataset_id,
                    reliability_score=0.0,
                    status="failed",
                    issue_summary={"error": error_message, "phase": "processing"},
                    anomaly_count=0,
                    duplicate_count=0,
                    recommendations=["System error during analysis. Check logs."],
                    error_message=error_message,
                    is_sampled=False,
                    sample_size=0,
                )
            except Exception as db_exc:
                logger.error("Failed to update dataset status to failed: %s", db_exc)
            
            # We do NOT raise here to avoid crashing the background task runner wrapper if any.
            # But normally logic dictates we might want to let it bubble up. 
            # Given the user wants "graceful handle", swallowing here but ensuring DB is updated is better.
            return

    async def get_dataset_status(self, dataset_id: str) -> Dataset:
        dataset = await self._dataset_repo.get_by_id(dataset_id)
        if dataset is None:
            raise ValueError("Dataset not found")
        return dataset

    async def list_datasets(self, limit: int = 20) -> list[DatasetStatusResponse]:
        datasets = await self._dataset_repo.list_all(limit=limit)
        # We need to check if there are reports to get error_messages for failed ones
        results = []
        for ds in datasets:
            error_msg = None
            if ds.status == "failed":
                report = await self._report_repo.get_by_dataset_id(str(ds.id))
                if report:
                    error_msg = report.error_message
            
            results.append(DatasetStatusResponse(
                dataset_id=str(ds.id),
                name=ds.name,
                filename=ds.filename,
                status=ds.status,
                rows=ds.rows,
                columns=ds.columns,
                error_message=error_msg,
                uploaded_at=ds.uploaded_at,
                processed_at=ds.processed_at,
            ))
        return results

    async def get_audit_report(self, dataset_id: str) -> Optional[AuditReportResponse]:
        report = await self._report_repo.get_by_dataset_id(dataset_id)
        if report is None:
            return None

        profiles_docs = await self._column_repo.get_for_dataset(dataset_id)
        columns = [
            ColumnProfileSchema(
                column_name=doc["column_name"],
                metrics=doc.get("metrics", {}),
                issues=doc.get("issues", []),
            )
            for doc in profiles_docs
        ]

        return AuditReportResponse(
            dataset_id=str(report.dataset_id),
            reliability_score=report.reliability_score,
            status=report.status,
            issue_summary=report.issue_summary,
            anomaly_count=report.anomaly_count,
            duplicate_count=report.duplicate_count,
            recommendations=report.recommendations,
            created_at=report.created_at,
            error_message=report.error_message,
            is_sampled=report.is_sampled,
            sample_size=report.sample_size,
            columns=columns,
        )


def _build_recommendations(
    profiles: dict,
    inconsistency_issues: dict,
    anomaly_stats: dict,
    duplicate_stats: dict,
) -> list[str]:
    """
    Generate simple textual recommendations from metrics.
    """
    recs: list[str] = []

    high_missing = [
        col
        for col, p in profiles.items()
        if p.get("missing_percentage", 0.0) > 30.0
    ]
    if high_missing:
        recs.append(
            f"Columns with high missing values (>30%): {', '.join(high_missing)}. "
            "Consider imputation or dropping."
        )

    if inconsistency_issues:
        recs.append(
            "Resolve schema inconsistencies in columns: "
            + ", ".join(sorted(inconsistency_issues.keys()))
        )

    if float(anomaly_stats.get("anomaly_ratio", 0.0)) > 0.05:
        recs.append(
            "High anomaly ratio detected; review outlier records for data quality issues."
        )

    if float(duplicate_stats.get("duplicate_ratio", 0.0)) > 0.01:
        recs.append(
            "Significant duplicate records found; consider de-duplication strategies."
        )

    if not recs:
        recs.append("Dataset quality is generally good; monitor periodically.")

    return recs

