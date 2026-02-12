from __future__ import annotations

from datetime import datetime, timezone
from typing import Dict, List

import pandas as pd

from app.ai_modules.common import infer_column_types


class ConsistencyChecker:
    """
    Consistency checker operating on sampled values and column profiles.

    This module focuses on:
    - Type/format consistency (e.g. emails, phone numbers, URLs, dates).
    - Simple business-logic and temporal checks inferred from column names.

    It is intentionally heuristic and lightweight, designed to complement
    the core inconsistency detector without adding heavy dependencies.
    """

    def __init__(self) -> None:
        # Per-column text samples for pattern checks
        self._string_samples: Dict[str, List[str]] = {}

    def process_chunk(self, chunk: pd.DataFrame) -> None:
        """
        Collect string samples per column from a chunk.
        """
        for col in chunk.columns:
            series = chunk[col].astype(str)
            samples = self._string_samples.setdefault(col, [])
            if len(samples) < 5_000:
                non_null = series[series.notna() & (series != "")]
                remaining = 5_000 - len(samples)
                samples.extend(non_null.head(remaining).tolist())

    def _looks_like_email(self, name: str, samples: List[str]) -> bool:
        if "email" in name.lower():
            return True
        if not samples:
            return False
        sample_series = pd.Series(samples[:500])
        # naive heuristic: contains '@' and a dot after
        mask = sample_series.str.contains(r".+@.+\..+", regex=True)
        return mask.mean() > 0.5

    def _looks_like_phone(self, name: str, samples: List[str]) -> bool:
        if "phone" in name.lower() or "mobile" in name.lower():
            return True
        if not samples:
            return False
        sample_series = pd.Series(samples[:500])
        mask = sample_series.str.contains(r"[0-9]{7,}", regex=True)
        return mask.mean() > 0.5

    def _looks_like_url(self, name: str, samples: List[str]) -> bool:
        if "url" in name.lower() or "link" in name.lower():
            return True
        if not samples:
            return False
        sample_series = pd.Series(samples[:500])
        mask = sample_series.str.contains(r"^https?://", regex=True)
        return mask.mean() > 0.5

    def _looks_like_date(self, name: str, samples: List[str]) -> bool:
        if "date" in name.lower():
            return True
        if not samples:
            return False
        sample_series = pd.Series(samples[:500])
        parsed = pd.to_datetime(sample_series, errors="coerce", infer_datetime_format=True)
        return parsed.notna().mean() > 0.5

    def evaluate(self, profiles: Dict[str, dict]) -> Dict[str, List[str]]:
        """
        Evaluate consistency issues based on profiles and collected samples.
        """
        issues: Dict[str, List[str]] = {}
        now = datetime.now(timezone.utc)

        for col, metrics in profiles.items():
            col_issues: List[str] = []
            inferred_type = metrics.get("inferred_type")
            samples = self._string_samples.get(col, [])[:2000]
            sample_series = pd.Series(samples) if samples else pd.Series([], dtype=str)

            # Type consistency: inferred type vs actual representation
            if inferred_type == "numeric":
                # flag if many non-digit patterns are present
                if not sample_series.empty:
                    non_numeric_ratio = (
                        ~sample_series.str.match(r"^-?\d+(\.\d+)?$", na=False)
                    ).mean()
                    if non_numeric_ratio > 0.1:
                        col_issues.append(
                            "Type inconsistency: many non-numeric representations in a numeric column."
                        )

            # Format validation heuristics
            if self._looks_like_email(col, samples):
                invalid_ratio = 0.0
                if not sample_series.empty:
                    invalid_mask = ~sample_series.str.contains(
                        r"^[^@\s]+@[^@\s]+\.[^@\s]+$", regex=True
                    )
                    invalid_ratio = invalid_mask.mean()
                if invalid_ratio > 0.0:
                    col_issues.append(
                        f"Email format violations detected (~{invalid_ratio*100:.1f}% invalid)."
                    )

            if self._looks_like_phone(col, samples):
                if not sample_series.empty:
                    short_mask = sample_series.str.len() < 7
                    if short_mask.mean() > 0.05:
                        col_issues.append(
                            "Phone number length inconsistencies detected (very short values present)."
                        )

            if self._looks_like_url(col, samples):
                if not sample_series.empty:
                    invalid_mask = ~sample_series.str.contains(
                        r"^https?://", regex=True, na=False
                    )
                    if invalid_mask.mean() > 0.1:
                        col_issues.append(
                            "URL format inconsistencies detected (values not starting with http/https)."
                        )

            # Temporal consistency: future dates
            if inferred_type == "datetime" or self._looks_like_date(col, samples):
                if not sample_series.empty:
                    parsed = pd.to_datetime(
                        sample_series, errors="coerce", infer_datetime_format=True
                    )
                    # Align timezones to prevent comparison crashes
                    if parsed.dt.tz is None:
                        parsed = parsed.dt.localize('UTC')
                    
                    future_mask = parsed > now
                    if future_mask.any():
                        col_issues.append("Temporal inconsistency: future dates detected.")

            # Simple business-logic inspired checks based on column name
            lname = col.lower()
            if inferred_type == "numeric" and any(
                key in lname for key in ["amount", "price", "qty", "quantity", "age"]
            ):
                # Negative amount / age is suspicious
                if not sample_series.empty:
                    numeric_sample = pd.to_numeric(sample_series, errors="coerce")
                    if (numeric_sample < 0).mean() > 0.01:
                        col_issues.append(
                            "Business rule violation: negative values detected for a quantity/amount-like column."
                        )

            if col_issues:
                issues[col] = col_issues

        return issues

