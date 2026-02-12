from __future__ import annotations

from typing import Dict, List, Tuple

import numpy as np
import pandas as pd

from app.ai_modules.common import detect_mixed_types, infer_column_types


class ColumnProfiler:
    """
    Incremental column profiler operating on DataFrame chunks.

    For memory safety on very large datasets, this profiler keeps at most
    10,000 sample values per column for approximate statistics such as
    median and standard deviation.

    Phase 1 enhancements add:
    - Rich numeric distribution statistics (variance, skewness, kurtosis,
      quartiles, IQR, distribution type).
    - Categorical intelligence (cardinality, frequency distribution,
      entropy, rare category detection).
    """

    def __init__(self) -> None:
        # Per-column aggregation
        self._counts: Dict[str, int] = {}
        self._missing_counts: Dict[str, int] = {}
        self._unique_values: Dict[str, set] = {}

        # Numeric statistics
        self._numeric_sum: Dict[str, float] = {}
        self._numeric_sumsq: Dict[str, float] = {}
        self._numeric_min: Dict[str, float] = {}
        self._numeric_max: Dict[str, float] = {}

        # Samples for median/std and type inference
        self._samples: Dict[str, List[object]] = {}

    def process_chunk(self, chunk: pd.DataFrame) -> None:
        """
        Update statistics from a single chunk.
        """
        for col in chunk.columns:
            series = chunk[col]
            total = len(series)
            missing = series.isna().sum() + (series == "").sum()

            self._counts[col] = self._counts.get(col, 0) + total
            self._missing_counts[col] = self._missing_counts.get(col, 0) + int(missing)

            # Unique tracking (cap set size to avoid memory explosion)
            uniq_set = self._unique_values.setdefault(col, set())
            if len(uniq_set) < 50_000:
                uniq_set.update(series.dropna().astype(str).unique().tolist())

            # Sample collection (cap per-column to 10,000 rows to bound memory)
            col_samples = self._samples.setdefault(col, [])
            if len(col_samples) < 10_000:
                non_null_sample = series.dropna().tolist()
                remaining_capacity = 10_000 - len(col_samples)
                col_samples.extend(non_null_sample[:remaining_capacity])

            # Numeric stats
            numeric_series = pd.to_numeric(series, errors="coerce")
            numeric_non_null = numeric_series.dropna()
            if not numeric_non_null.empty:
                s = numeric_non_null.sum()
                sq = (numeric_non_null ** 2).sum()
                mn = numeric_non_null.min()
                mx = numeric_non_null.max()

                self._numeric_sum[col] = self._numeric_sum.get(col, 0.0) + float(s)
                self._numeric_sumsq[col] = self._numeric_sumsq.get(col, 0.0) + float(sq)
                self._numeric_min[col] = (
                    mn
                    if col not in self._numeric_min
                    else float(min(self._numeric_min[col], mn))
                )
                self._numeric_max[col] = (
                    mx
                    if col not in self._numeric_max
                    else float(max(self._numeric_max[col], mx))
                )

    def _infer_distribution_type(self, numeric_sample: pd.Series) -> str:
        """
        Heuristic distribution type classification based on skewness and kurtosis.
        """
        if numeric_sample.empty:
            return "unknown"

        skew = numeric_sample.skew()
        kurt = numeric_sample.kurtosis()

        if abs(skew) < 0.5 and abs(kurt) < 1:
            return "approximately_normal"
        if skew > 0.5:
            return "right_skewed"
        if skew < -0.5:
            return "left_skewed"
        if abs(kurt) >= 3:
            return "heavy_tailed"
        return "non_normal"

    def _compute_categorical_stats(self, sample_series: pd.Series) -> Dict[str, object]:
        """
        Compute categorical intelligence metrics from a sample.
        """
        if sample_series.empty:
            return {
                "cardinality": 0,
                "entropy": 0.0,
                "rare_categories": [],
                "rare_threshold": 0.02,
            }

        value_counts = sample_series.value_counts()
        total = float(value_counts.sum())
        probs = value_counts / total
        # Shannon entropy in bits
        entropy = float(-(probs * np.log2(probs)).sum())

        rare_threshold = 0.02
        rare_mask = probs < rare_threshold
        rare_categories = value_counts[rare_mask].index.tolist()

        return {
            "cardinality": int(len(value_counts)),
            "entropy": entropy,
            "rare_categories": rare_categories,
            "rare_threshold": rare_threshold,
        }

    def build_profiles(self) -> Tuple[Dict[str, dict], int]:
        """
        Build final column profiles and return them with total row count.
        """
        profiles: Dict[str, dict] = {}
        total_rows = max(self._counts.values()) if self._counts else 0

        for col, count in self._counts.items():
            missing = self._missing_counts.get(col, 0)
            uniq_values = self._unique_values.get(col, set())
            unique_count = len(uniq_values)

            missing_pct = (missing / count) * 100 if count > 0 else 0.0
            unique_ratio = (unique_count / count) if count > 0 else 0.0

            samples = self._samples.get(col, [])
            sample_series = pd.Series(samples) if samples else pd.Series([], dtype=object)

            col_type = infer_column_types(sample_series)
            mixed_types_flag = detect_mixed_types(sample_series)

            numeric_mean = None
            numeric_std = None
            numeric_var = None
            numeric_min = None
            numeric_max = None
            numeric_median = None
            numeric_mode = None
            q1 = None
            q3 = None
            iqr = None
            skewness = None
            kurtosis = None
            distribution_type = None

            if col in self._numeric_sum and count > 0:
                s = self._numeric_sum[col]
                sq = self._numeric_sumsq[col]
                numeric_mean = s / count
                # Population variance approximation
                var = (sq / count) - (numeric_mean**2)
                var = max(var, 0.0)
                numeric_var = float(var)
                numeric_std = float(np.sqrt(var))
                numeric_min = self._numeric_min[col]
                numeric_max = self._numeric_max[col]

                numeric_sample = pd.to_numeric(sample_series, errors="coerce").dropna()
                if not numeric_sample.empty:
                    numeric_median = float(numeric_sample.median())
                    try:
                        numeric_mode_val = numeric_sample.mode().iloc[0]
                        numeric_mode = float(numeric_mode_val)
                    except Exception:
                        numeric_mode = None

                    q1 = float(numeric_sample.quantile(0.25))
                    q3 = float(numeric_sample.quantile(0.75))
                    iqr = float(q3 - q1)
                    skewness = float(numeric_sample.skew())
                    kurtosis = float(numeric_sample.kurtosis())
                    distribution_type = self._infer_distribution_type(numeric_sample)

            # Top 5 frequent values from samples
            top_values = (
                sample_series.value_counts().head(5).to_dict() if not sample_series.empty else {}
            )

            categorical_stats = self._compute_categorical_stats(sample_series.astype(str))

            profiles[col] = {
                # Core metrics
                "missing_percentage": float(missing_pct),
                "unique_ratio": float(unique_ratio),
                "unique_count": unique_count,
                "inferred_type": col_type,
                "mixed_types": mixed_types_flag,
                "top_values": top_values,
                # Numeric distribution statistics
                "mean": float(numeric_mean) if numeric_mean is not None else None,
                "median": float(numeric_median) if numeric_median is not None else None,
                "mode": float(numeric_mode) if numeric_mode is not None else None,
                "std": float(numeric_std) if numeric_std is not None else None,
                "variance": float(numeric_var) if numeric_var is not None else None,
                "min": float(numeric_min) if numeric_min is not None else None,
                "max": float(numeric_max) if numeric_max is not None else None,
                "q1": float(q1) if q1 is not None else None,
                "q3": float(q3) if q3 is not None else None,
                "iqr": float(iqr) if iqr is not None else None,
                "skewness": float(skewness) if skewness is not None else None,
                "kurtosis": float(kurtosis) if kurtosis is not None else None,
                "distribution_type": distribution_type,
                # Categorical intelligence
                "cardinality": categorical_stats["cardinality"],
                "entropy": categorical_stats["entropy"],
                "rare_categories": categorical_stats["rare_categories"],
                "rare_category_threshold": categorical_stats["rare_threshold"],
            }

        return profiles, total_rows

