from __future__ import annotations

from typing import Dict, List, Tuple

import numpy as np
import pandas as pd


def infer_column_types(sample: pd.Series) -> str:
    """
    Infer a simple semantic type for a column based on a sample.
    """
    non_null = sample.dropna()
    if non_null.empty:
        return "unknown"

    # Try numeric
    numeric = pd.to_numeric(non_null, errors="coerce")
    if numeric.notna().mean() > 0.9:
        return "numeric"

    # Try datetime
    dt = pd.to_datetime(non_null, errors="coerce", infer_datetime_format=True)
    if dt.notna().mean() > 0.9:
        return "datetime"

    # Otherwise treat as categorical/text
    return "categorical"


def select_numeric_columns(df: pd.DataFrame) -> List[str]:
    """
    Select numeric-like columns from an object-typed DataFrame.
    """
    numeric_cols: List[str] = []
    for col in df.columns:
        series = pd.to_numeric(df[col], errors="coerce")
        if series.notna().sum() > 0:
            numeric_cols.append(col)
    return numeric_cols


def detect_mixed_types(series: pd.Series) -> bool:
    """
    Detect whether a column contains mixed Python types.
    """
    types = {type(v) for v in series.dropna()}
    return len(types) > 1


def reservoir_sample(
    existing: pd.DataFrame,
    new_chunk: pd.DataFrame,
    max_samples: int = 10_000,
) -> pd.DataFrame:
    """
    Reservoir sampling across chunks for large datasets.
    """
    if existing is None or existing.empty:
        sample = new_chunk.sample(
            n=min(len(new_chunk), max_samples), random_state=42
        )
        return sample

    combined = pd.concat([existing, new_chunk], ignore_index=True)
    if len(combined) <= max_samples:
        return combined
    return combined.sample(n=max_samples, random_state=42)

