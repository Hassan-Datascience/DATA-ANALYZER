from __future__ import annotations

from typing import Dict, List, Tuple

from app.core.config import settings


def compute_reliability_score(
    profiles: Dict[str, dict],
    inconsistency_issues: Dict[str, List[str]],
    anomaly_stats: Dict[str, float | int],
    duplicate_stats: Dict[str, float | int],
) -> Tuple[float, str, Dict[str, object]]:
    """
    Compute a multi-dimensional data quality score and overall status.

    Dimensions:
    - Completeness: driven primarily by missing values.
    - Validity: influenced by inconsistencies and anomaly presence.
    - Consistency: fraction of columns with consistency/inconsistency issues.
    - Accuracy: anomaly and duplicate impacts.
    - Timeliness: currently defaulted to 100 (not evaluated without explicit
      temporal metadata).
    """
    if not profiles:
        return 0.0, "Critical", {}

    total_cols = len(profiles)

    # Missing penalty: average missing percentage across columns (0-100)
    missing_pcts = [p.get("missing_percentage", 0.0) for p in profiles.values()]
    missing_penalty = sum(missing_pcts) / max(len(missing_pcts), 1)

    # Anomaly penalty: anomaly_ratio (0-1) scaled to 0-100
    anomaly_ratio = float(anomaly_stats.get("anomaly_ratio", 0.0))
    anomaly_penalty = anomaly_ratio * 100

    # Inconsistency penalty: fraction of columns with issues (0-1) scaled to 0-100
    cols_with_issues = len(inconsistency_issues)
    inconsistency_fraction = cols_with_issues / total_cols if total_cols > 0 else 0.0
    inconsistency_penalty = inconsistency_fraction * 100

    # Duplicate penalty: duplicate_ratio (0-1) scaled to 0-100
    duplicate_ratio = float(duplicate_stats.get("duplicate_ratio", 0.0))
    duplicate_penalty = duplicate_ratio * 100

    # Dimension scores (0-100, higher is better)
    completeness_score = max(0.0, 100.0 - missing_penalty)
    consistency_score = max(0.0, 100.0 - inconsistency_penalty)
    accuracy_score = max(
        0.0, 100.0 - 0.5 * (anomaly_penalty + duplicate_penalty)
    )  # simple blend
    # Validity blends consistency and anomalies
    validity_score = max(
        0.0, 100.0 - 0.5 * (inconsistency_penalty + anomaly_penalty)
    )
    # Timeliness requires explicit temporal metadata; default to 100 for now
    timeliness_score = 100.0

    # Preserve original weighted reliability for backward compatibility
    w1 = settings.reliability_weight_missing
    w2 = settings.reliability_weight_anomaly
    w3 = settings.reliability_weight_inconsistency
    w4 = settings.reliability_weight_duplicate

    overall_score = 100.0 - (
        w1 * missing_penalty
        + w2 * anomaly_penalty
        + w3 * inconsistency_penalty
        + w4 * duplicate_penalty
    )
    overall_score = max(0.0, min(100.0, overall_score))

    if overall_score >= 85:
        status = "Healthy"
    elif overall_score >= 60:
        status = "Warning"
    else:
        status = "Critical"

    dimension_scores: Dict[str, float] = {
        "completeness": round(completeness_score, 2),
        "validity": round(validity_score, 2),
        "consistency": round(consistency_score, 2),
        "accuracy": round(accuracy_score, 2),
        "timeliness": round(timeliness_score, 2),
    }

    issue_summary: Dict[str, object] = {
        "missing": f"Average missing percentage: {missing_penalty:.2f}%",
        "anomalies": f"Anomaly ratio: {anomaly_ratio:.4f}",
        "inconsistencies": f"Columns with issues: {cols_with_issues}/{total_cols}",
        "duplicates": f"Duplicate ratio: {duplicate_ratio:.4f}",
        "dimensions": dimension_scores,
    }

    return overall_score, status, issue_summary


