from __future__ import annotations

from typing import Dict, List, Optional

import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest

from app.ai_modules.common import reservoir_sample, select_numeric_columns


class AnomalyDetector:
    """
    IsolationForest-based anomaly detector operating on numeric columns.

    To remain memory-efficient, this detector relies on reservoir sampling
    and caps its internal numeric sample to roughly 10,000 rows.
    """

    def __init__(self) -> None:
        self._numeric_columns: Optional[List[str]] = None
        self._sampled_numeric: Optional[pd.DataFrame] = None

    def process_chunk_for_sampling(self, chunk: pd.DataFrame) -> None:
        """
        Collect a stratified sample of numeric rows across chunks.
        """
        if self._numeric_columns is None:
            self._numeric_columns = select_numeric_columns(chunk)
            if not self._numeric_columns:
                return

        numeric_df = chunk[self._numeric_columns].apply(
            pd.to_numeric, errors="coerce"
        ).dropna(how="any")
        if numeric_df.empty:
            return

        self._sampled_numeric = reservoir_sample(self._sampled_numeric, numeric_df)

    def _compute_z_score_outliers(self, data: np.ndarray, threshold: float = 3.0) -> int:
        """
        Count outliers using standard Z-score method |z| > threshold.
        """
        if data.size == 0:
            return 0
        mean = np.mean(data, axis=0)
        std = np.std(data, axis=0)
        # Avoid division by zero
        std[std == 0] = 1.0
        z = (data - mean) / std
        mask = np.any(np.abs(z) > threshold, axis=1)
        return int(np.sum(mask))

    def _compute_modified_z_outliers(self, data: np.ndarray, threshold: float = 3.5) -> int:
        """
        Count outliers using modified Z-score based on MAD.
        """
        if data.size == 0:
            return 0
        median = np.median(data, axis=0)
        diff = np.abs(data - median)
        mad = np.median(diff, axis=0)
        mad[mad == 0] = 1.0
        modified_z = 0.6745 * (data - median) / mad
        mask = np.any(np.abs(modified_z) > threshold, axis=1)
        return int(np.sum(mask))

    def _compute_iqr_outliers(self, data: np.ndarray, factor: float = 1.5) -> int:
        """
        Count outliers using the IQR rule per column.
        """
        if data.size == 0:
            return 0
        q1 = np.percentile(data, 25, axis=0)
        q3 = np.percentile(data, 75, axis=0)
        iqr = q3 - q1
        iqr[iqr == 0] = 1.0
        lower = q1 - factor * iqr
        upper = q3 + factor * iqr
        mask = np.any((data < lower) | (data > upper), axis=1)
        return int(np.sum(mask))

    def compute_anomalies(self) -> Dict[str, float | int]:
        """
        Train IsolationForest on sampled numeric data and compute anomaly stats.

        Phase 1 enhancements add:
        - Statistical anomaly counts via Z-score, modified Z-score (MAD),
          and IQR methods computed on the same sampled numeric data.
        """
        if self._sampled_numeric is None or self._sampled_numeric.empty:
            return {
                "anomaly_count": 0,
                "anomaly_ratio": 0.0,
                "sample_size": 0,
                "z_score_outliers": 0,
                "modified_z_outliers": 0,
                "iqr_outliers": 0,
            }

        values = self._sampled_numeric.values.astype(float)

        # IsolationForest-based multivariate anomalies
        model = IsolationForest(
            n_estimators=200,
            contamination=0.02,
            random_state=42,
        )
        model.fit(values)
        preds = model.predict(values)

        anomaly_mask = preds == -1
        anomaly_count = int(np.sum(anomaly_mask))
        total = len(preds)
        ratio = anomaly_count / total if total > 0 else 0.0

        # Statistical anomalies on the same sample
        z_outliers = self._compute_z_score_outliers(values)
        modified_z_outliers = self._compute_modified_z_outliers(values)
        iqr_outliers = self._compute_iqr_outliers(values)

        return {
            "anomaly_count": anomaly_count,
            "anomaly_ratio": float(ratio),
            "sample_size": int(total),
            "z_score_outliers": z_outliers,
            "modified_z_outliers": modified_z_outliers,
            "iqr_outliers": iqr_outliers,
        }

