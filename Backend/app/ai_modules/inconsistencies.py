from __future__ import annotations

from typing import Dict, List

import pandas as pd

from app.ai_modules.common import infer_column_types


class InconsistencyDetector:
    """
    Detects schema and value inconsistencies across columns.
    """

    def __init__(self) -> None:
        # Track per-column original string samples for pattern checking
        self._string_samples: Dict[str, List[str]] = {}

    def process_chunk(self, chunk: pd.DataFrame) -> None:
        for col in chunk.columns:
            series = chunk[col].astype(str)
            samples = self._string_samples.setdefault(col, [])
            if len(samples) < 5_000:
                non_null = series[series.notna() & (series != "")]
                remaining = 5_000 - len(samples)
                samples.extend(non_null.head(remaining).tolist())

    def evaluate(self, profiles: Dict[str, dict]) -> Dict[str, List[str]]:
        """
        Use profiling metrics and collected string samples to derive issues.
        """
        issues: Dict[str, List[str]] = {}
        for col, metrics in profiles.items():
            col_issues: List[str] = []
            inferred_type = metrics.get("inferred_type")
            unique_ratio = metrics.get("unique_ratio", 0.0)

            if metrics.get("mixed_types"):
                col_issues.append("Mixed data types detected in column.")

            # High cardinality categorical explosion
            if inferred_type == "categorical" and unique_ratio > 0.8 and metrics.get(
                "unique_count", 0
            ) > 1000:
                col_issues.append("High cardinality categorical values (entropy explosion).")

            # Date format inconsistencies (heuristic)
            samples = self._string_samples.get(col, [])[:1000]
            if samples:
                dt = pd.to_datetime(samples, errors="coerce", infer_datetime_format=True)
                parse_rate = dt.notna().mean()
                if 0.3 < parse_rate < 0.9:
                    col_issues.append("Inconsistent date formats or invalid date values.")

            # Simple pattern mismatch detection: look for consistent length
            if samples:
                lengths = pd.Series(samples).str.len()
                if lengths.std() > 10 and inferred_type == "categorical":
                    col_issues.append("Inconsistent text patterns detected in categorical data.")

            # Categorical rare-value anomalies: values appearing only 1-2 times.
            # We look at the frequency distribution over our sampled strings and flag
            # columns where a significant proportion of values are extremely rare.
            if inferred_type == "categorical":
                cat_samples = self._string_samples.get(col, [])[:5000]
                if cat_samples:
                    value_counts = pd.Series(cat_samples).value_counts()
                    rare_mask = value_counts <= 2
                    rare_count = int(value_counts[rare_mask].sum())
                    total_count = int(value_counts.sum())
                    if total_count > 0:
                        rare_ratio = rare_count / total_count
                        # Heuristic: if more than 20% of occurrences are from very rare values,
                        # treat this as a potential categorical anomaly.
                        if rare_ratio > 0.2:
                            col_issues.append(
                                "Rare categorical values detected (values appearing only 1-2 times)."
                            )

            if col_issues:
                issues[col] = col_issues

        return issues

