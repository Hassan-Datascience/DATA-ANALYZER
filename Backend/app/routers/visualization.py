from typing import Any, Dict, List

import numpy as np
import pandas as pd
from fastapi import APIRouter, Depends, HTTPException, status

from app.core.dependencies import (
    get_audit_report_repository,
    get_column_profile_repository,
    get_dataset_repository,
)
from app.repositories.audit_report_repository import AuditReportRepository
from app.repositories.column_profile_repository import ColumnProfileRepository
from app.repositories.dataset_repository import DatasetRepository
from app.schemas.visualization import (
    AnomaliesVisualizationResponse,
    CorrelationsResponse,
    DistributionsResponse,
    ProfileVisualizationResponse,
    QualityReportResponse,
    DatasetSummary,
)
from app.services.csv_processing_service import CsvChunkProcessor
from app.ai_modules.common import select_numeric_columns


router = APIRouter(tags=["visualization"])


@router.post(
    "/visualization/profile/{dataset_id}",
    response_model=ProfileVisualizationResponse,
    status_code=status.HTTP_200_OK,
)
async def get_profile_visualization(
    dataset_id: str,
    dataset_repo: DatasetRepository = Depends(get_dataset_repository),
    column_repo: ColumnProfileRepository = Depends(get_column_profile_repository),
    report_repo: AuditReportRepository = Depends(get_audit_report_repository),
) -> ProfileVisualizationResponse:
    """
    Return dataset and column-level profiling information in a format
    convenient for frontend visualization.
    """
    dataset = await dataset_repo.get_by_id(dataset_id)
    if dataset is None:
        raise HTTPException(status_code=404, detail="Dataset not found.")

    report = await report_repo.get_by_dataset_id(dataset_id)
    if report is None:
        raise HTTPException(
            status_code=404,
            detail="No audit report available for this dataset. Run an audit first.",
        )

    profiles_docs = await column_repo.get_for_dataset(dataset_id)

    dataset_summary = DatasetSummary(
        dataset_id=str(dataset.id),
        name=dataset.name or dataset.filename,
        rows=dataset.rows or 0,
        columns=dataset.columns or 0,
    )

    # Quality scores: expose overall reliability and dimension scores if present.
    quality_scores: Dict[str, Any] = {
        "overall": {
            "score": report.reliability_score,
            "status": report.status,
        }
    }
    dimensions = report.issue_summary.get("dimensions") if report.issue_summary else None
    if isinstance(dimensions, dict):
        quality_scores.update(dimensions=dimensions)

    # Column profiles: flatten metrics + issues for visualization
    column_profiles: List[Dict[str, Any]] = []
    for doc in profiles_docs:
        column_profiles.append(
            {
                "column": doc["column_name"],
                "metrics": doc.get("metrics", {}),
                "issues": doc.get("issues", []),
            }
        )

    return ProfileVisualizationResponse(
        dataset_summary=dataset_summary,
        quality_scores=quality_scores,
        column_profiles=column_profiles,
    )


@router.get(
    "/visualization/distributions/{dataset_id}",
    response_model=DistributionsResponse,
)
async def get_distributions(
    dataset_id: str,
    dataset_repo: DatasetRepository = Depends(get_dataset_repository),
) -> DistributionsResponse:
    """
    Compute distribution data (histograms/box-plots for numeric,
    pie/bar charts for categoricals) from a bounded sample of the CSV.
    """
    dataset = await dataset_repo.get_by_id(dataset_id)
    if dataset is None:
        raise HTTPException(status_code=404, detail="Dataset not found.")

    processor = CsvChunkProcessor(dataset.storage_path)

    numeric_samples: Dict[str, List[float]] = {}
    categorical_samples: Dict[str, List[str]] = {}

    max_numeric_samples = 20_000
    max_categorical_samples = 5_000

    for chunk in processor.iter_chunks():
        # Determine numeric columns on first relevant chunk
        num_cols = select_numeric_columns(chunk)

        # Numeric sampling
        for col in num_cols:
            series = pd.to_numeric(chunk[col], errors="coerce").dropna()
            if series.empty:
                continue
            samples = numeric_samples.setdefault(col, [])
            remaining = max_numeric_samples - len(samples)
            if remaining <= 0:
                continue
            samples.extend(series.tolist()[:remaining])

        # Categorical sampling (for non-numeric/object-like)
        for col in chunk.columns:
            if col in num_cols:
                continue
            series = chunk[col].astype(str)
            samples = categorical_samples.setdefault(col, [])
            remaining = max_categorical_samples - len(samples)
            if remaining <= 0:
                continue
            non_null = series[series.notna() & (series != "")]
            samples.extend(non_null.tolist()[:remaining])

    numeric_distributions: List[Dict[str, Any]] = []
    for col, values in numeric_samples.items():
        if not values:
            continue
        arr = np.array(values, dtype=float)
        bins = 20
        hist, bin_edges = np.histogram(arr, bins=bins)

        q1 = float(np.percentile(arr, 25))
        median = float(np.percentile(arr, 50))
        q3 = float(np.percentile(arr, 75))
        iqr = q3 - q1
        lower = q1 - 1.5 * iqr
        upper = q3 + 1.5 * iqr
        outliers = arr[(arr < lower) | (arr > upper)].tolist()

        numeric_distributions.append(
            {
                "column": col,
                "histogram": {
                    "bin_edges": bin_edges.tolist(),
                    "frequencies": hist.tolist(),
                },
                "box_plot": {
                    "min": float(np.min(arr)),
                    "q1": q1,
                    "median": median,
                    "q3": q3,
                    "max": float(np.max(arr)),
                    "outliers": outliers,
                },
            }
        )

    categorical_distributions: List[Dict[str, Any]] = []
    for col, values in categorical_samples.items():
        if not values:
            continue
        series = pd.Series(values)
        value_counts = series.value_counts()
        total = float(value_counts.sum())

        # Limit to top categories for visualization
        top_counts = value_counts.head(15)
        labels = top_counts.index.tolist()
        counts = top_counts.tolist()
        percentages = [(c / total) * 100 for c in counts]

        categorical_distributions.append(
            {
                "column": col,
                "pie_chart": {
                    "labels": labels,
                    "values": counts,
                    "percentages": percentages,
                },
                "bar_chart": {
                    "categories": labels,
                    "frequencies": counts,
                },
            }
        )

    return DistributionsResponse(
        numeric_distributions=numeric_distributions,
        categorical_distributions=categorical_distributions,
    )


@router.get(
    "/visualization/anomalies/{dataset_id}",
    response_model=AnomaliesVisualizationResponse,
)
async def get_anomalies_visualization(
    dataset_id: str,
    dataset_repo: DatasetRepository = Depends(get_dataset_repository),
    report_repo: AuditReportRepository = Depends(get_audit_report_repository),
) -> AnomaliesVisualizationResponse:
    """
    Return high-level anomaly statistics suitable for visualization.

    Note: the current implementation does not track per-row anomaly details,
    so anomalies_by_column and scatter_plots are returned as empty lists.
    """
    dataset = await dataset_repo.get_by_id(dataset_id)
    if dataset is None:
        raise HTTPException(status_code=404, detail="Dataset not found.")

    report = await report_repo.get_by_dataset_id(dataset_id)
    if report is None:
        raise HTTPException(
            status_code=404,
            detail="No audit report available for this dataset. Run an audit first.",
        )

    total_anomalies = report.anomaly_count
    rows = dataset.rows or 0
    pct = (total_anomalies / rows) * 100 if rows > 0 else 0.0

    anomaly_summary = {
        "total_anomalies": total_anomalies,
        "percentage_of_data": pct,
        # Severity distribution is not explicitly tracked; we expose a simple view.
        "severity_distribution": {
            "critical": 0,
            "high": 0,
            "medium": total_anomalies,
            "low": 0,
        },
    }

    return AnomaliesVisualizationResponse(
        anomaly_summary=anomaly_summary,
        anomalies_by_column=[],
        scatter_plots=[],
    )


def _compute_cramers_v(table: pd.DataFrame) -> float:
    """
    Compute Cramér's V for a contingency table without external dependencies.
    """
    if table.size == 0:
        return 0.0
    observed = table.values
    n = observed.sum()
    if n == 0:
        return 0.0
    row_sums = observed.sum(axis=1, keepdims=True)
    col_sums = observed.sum(axis=0, keepdims=True)
    expected = row_sums @ col_sums / n
    # Avoid division by zero
    expected[expected == 0] = 1.0
    chi2 = ((observed - expected) ** 2 / expected).sum()
    r, k = observed.shape
    denom = n * (min(r - 1, k - 1) or 1)
    return float(np.sqrt(chi2 / denom)) if denom > 0 else 0.0


@router.get(
    "/visualization/correlations/{dataset_id}",
    response_model=CorrelationsResponse,
)
async def get_correlations(
    dataset_id: str,
    dataset_repo: DatasetRepository = Depends(get_dataset_repository),
) -> CorrelationsResponse:
    """
    Compute correlation and association metrics from a bounded sample
    of the dataset.
    """
    dataset = await dataset_repo.get_by_id(dataset_id)
    if dataset is None:
        raise HTTPException(status_code=404, detail="Dataset not found.")

    processor = CsvChunkProcessor(dataset.storage_path)

    sample_rows: List[pd.DataFrame] = []
    max_rows = 5_000

    for chunk in processor.iter_chunks():
        if len(sample_rows) * len(chunk) >= max_rows:
            break
        sample_rows.append(chunk)

    if not sample_rows:
        numeric_correlations: Dict[str, Any] = {
            "columns": [],
            "correlation_matrix": [],
            "p_values": [],
        }
        categorical_associations: Dict[str, Any] = {"associations": []}
        return CorrelationsResponse(
            numeric_correlations=numeric_correlations,
            categorical_associations=categorical_associations,
        )

    sample_df = pd.concat(sample_rows, ignore_index=True)

    # Numeric correlations
    numeric_cols = select_numeric_columns(sample_df)
    numeric_correlations: Dict[str, Any]
    if numeric_cols:
        numeric_data = sample_df[numeric_cols].apply(
            pd.to_numeric, errors="coerce"
        ).dropna(how="any")
        if not numeric_data.empty and len(numeric_cols) > 1:
            corr = numeric_data.corr(method="pearson")
            corr_matrix = corr.values.tolist()
            # p-values would require scipy; we return zeros as placeholders.
            zeros = [[0.0 for _ in numeric_cols] for _ in numeric_cols]
            numeric_correlations = {
                "columns": numeric_cols,
                "correlation_matrix": corr_matrix,
                "p_values": zeros,
            }
        else:
            numeric_correlations = {
                "columns": numeric_cols,
                "correlation_matrix": [],
                "p_values": [],
            }
    else:
        numeric_correlations = {
            "columns": [],
            "correlation_matrix": [],
            "p_values": [],
        }

    # Categorical associations (Cramér's V for a few pairs)
    categorical_cols = [
        c for c in sample_df.columns if c not in numeric_cols
    ]
    associations: List[Dict[str, Any]] = []
    max_pairs = 10
    pair_count = 0
    for i in range(len(categorical_cols)):
        for j in range(i + 1, len(categorical_cols)):
            if pair_count >= max_pairs:
                break
            col_a = categorical_cols[i]
            col_b = categorical_cols[j]
            table = pd.crosstab(sample_df[col_a], sample_df[col_b])
            if table.size == 0:
                continue
            v = _compute_cramers_v(table)
            if v <= 0:
                continue
            significance = "weak"
            if v >= 0.3:
                significance = "strong"
            elif v >= 0.1:
                significance = "moderate"
            associations.append(
                {
                    "column_pair": [col_a, col_b],
                    "cramers_v": v,
                    "significance": significance,
                }
            )
            pair_count += 1
        if pair_count >= max_pairs:
            break

    categorical_associations = {"associations": associations}

    return CorrelationsResponse(
        numeric_correlations=numeric_correlations,
        categorical_associations=categorical_associations,
    )


@router.get(
    "/visualization/report/{dataset_id}",
    response_model=QualityReportResponse,
)
async def get_quality_report(
    dataset_id: str,
    dataset_repo: DatasetRepository = Depends(get_dataset_repository),
    column_repo: ColumnProfileRepository = Depends(get_column_profile_repository),
    report_repo: AuditReportRepository = Depends(get_audit_report_repository),
) -> QualityReportResponse:
    """
    Return a high-level, dashboard-ready quality report derived from
    the audit report and column profiles.
    """
    dataset = await dataset_repo.get_by_id(dataset_id)
    if dataset is None:
        raise HTTPException(status_code=404, detail="Dataset not found.")

    report = await report_repo.get_by_dataset_id(dataset_id)
    if report is None:
        raise HTTPException(
            status_code=404,
            detail="No audit report available for this dataset. Run an audit first.",
        )

    profiles_docs = await column_repo.get_for_dataset(dataset_id)

    audit_metadata = {
        "dataset_id": dataset_id,
        "dataset_name": dataset.filename,
        "rows_processed": dataset.rows,
        "columns_analyzed": dataset.columns,
        "audit_timestamp": report.created_at,
        "processing_duration_ms": None,
        "data_quality_trend": "unknown",
    }

    overall_quality_score = report.reliability_score
    status_lower = report.status.lower()
    exec_status = "good" if status_lower == "healthy" else status_lower

    critical_issues = 0
    high_priority_issues = 0
    total_quality_issues = 0

    # Count total issues from column profiles
    for doc in profiles_docs:
        issues = doc.get("issues", [])
        total_quality_issues += len(issues)

    executive_summary = {
        "overall_quality_score": overall_quality_score,
        "status": exec_status,
        "critical_issues": critical_issues,
        "high_priority_issues": high_priority_issues,
        "total_quality_issues": total_quality_issues,
        "key_insights": [],
    }

    # Build a simplified issues summary as strings for the frontend contract
    missing_info = report.issue_summary.get("missing", "") if report.issue_summary else ""
    anomaly_info = report.issue_summary.get("anomalies", "") if report.issue_summary else ""
    inconsistency_info = (
        report.issue_summary.get("inconsistencies", "") if report.issue_summary else ""
    )
    duplicate_info = (
        report.issue_summary.get("duplicates", "") if report.issue_summary else ""
    )

    issues_summary = {
        "missing_values": missing_info,
        "anomalies": anomaly_info,
        "inconsistencies": inconsistency_info,
        "duplicates": duplicate_info,
    }

    # Column-level insights
    column_insights: List[Dict[str, Any]] = []
    for doc in profiles_docs:
        col_name = doc["column_name"]
        metrics = doc.get("metrics", {})
        issues = doc.get("issues", [])
        column_insights.append(
            {
                "column": col_name,
                "type": metrics.get("inferred_type"),
                "completeness": 100.0 - metrics.get("missing_percentage", 0.0),
                "validity": None,
                "insights": issues,
            }
        )

    recommendations = [
        {"severity": "medium", "issue": "See issues_summary for details", "recommendation": rec}
        for rec in report.recommendations
    ]

    return QualityReportResponse(
        audit_metadata=audit_metadata,
        executive_summary=executive_summary,
        issues_summary=issues_summary,
        column_insights=column_insights,
        recommendations=recommendations,
    )

