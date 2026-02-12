from __future__ import annotations

import hashlib
from typing import Dict, List, Set

import pandas as pd
from difflib import SequenceMatcher


class DuplicateDetector:
    """
    Duplicate detector with multiple strategies:

    - Exact row-level duplicates using SHA-256 hashing across chunks.
    - Key-based duplicates on heuristically chosen identifier-like columns
      (e.g. email, phone, id).
    - Lightweight fuzzy duplicates using string similarity on a bounded
      sample of values per text column (no external dependencies).
    """

    def __init__(self) -> None:
        # Exact row-level duplicates
        self._seen_hashes: set[str] = set()
        self._duplicate_count: int = 0
        self._total_rows: int = 0

        # Key-based duplicates (per-column)
        self._key_seen: Dict[str, Set[str]] = {}
        self._key_duplicate_counts: Dict[str, int] = {}

        # Fuzzy duplicates (per-column, via samples)
        self._string_samples: Dict[str, List[str]] = {}
        self._fuzzy_duplicate_pairs: int = 0

    def _candidate_key_columns(self, columns: List[str]) -> List[str]:
        """
        Heuristically determine key-like columns (email, phone, id, etc.).
        """
        keys: List[str] = []
        for name in columns:
            lname = name.lower()
            if any(k in lname for k in ["email", "phone", "mobile", "id", "ssn"]):
                keys.append(name)
        return keys

    def process_chunk(self, chunk: pd.DataFrame) -> None:
        """
        Hash each row and count duplicates across chunks.

        Also tracks key-based and fuzzy duplicate signals using bounded
        per-column samples to preserve memory characteristics.
        """
        self._total_rows += len(chunk)

        # Exact row duplicates
        for _, row in chunk.iterrows():
            row_str = "||".join(row.astype(str).tolist())
            digest = hashlib.sha256(row_str.encode("utf-8")).hexdigest()
            if digest in self._seen_hashes:
                self._duplicate_count += 1
            else:
                self._seen_hashes.add(digest)

        # Key-based duplicates
        key_cols = self._candidate_key_columns(list(chunk.columns))
        for col in key_cols:
            values = chunk[col].astype(str)
            seen = self._key_seen.setdefault(col, set())
            dup_count = self._key_duplicate_counts.get(col, 0)
            for v in values:
                if v in seen:
                    dup_count += 1
                else:
                    seen.add(v)
            self._key_duplicate_counts[col] = dup_count

        # Fuzzy duplicates: collect a small sample of unique values per text column
        for col in chunk.columns:
            series = chunk[col].astype(str)
            samples = self._string_samples.setdefault(col, [])
            if len(samples) >= 300:  # cap to keep pairwise comparisons manageable
                continue
            # add new unique values up to the cap
            unique_vals = series.dropna().unique().tolist()
            for val in unique_vals:
                if len(samples) >= 300:
                    break
                if val not in samples:
                    samples.append(val)

    def _compute_fuzzy_duplicates(self) -> int:
        """
        Compute fuzzy duplicate pairs per column using a simple similarity
        measure on a bounded sample of strings.
        """
        if self._fuzzy_duplicate_pairs:
            return self._fuzzy_duplicate_pairs

        threshold = 0.9
        total_pairs = 0
        for samples in self._string_samples.values():
            n = len(samples)
            if n <= 1:
                continue
            # naive O(n^2) pairwise comparison, but n is capped to 300
            for i in range(n):
                for j in range(i + 1, n):
                    s1, s2 = samples[i], samples[j]
                    if not s1 or not s2:
                        continue
                    ratio = SequenceMatcher(a=s1.lower(), b=s2.lower()).ratio()
                    if ratio >= threshold:
                        total_pairs += 1
        self._fuzzy_duplicate_pairs = total_pairs
        return total_pairs

    def get_stats(self) -> Dict[str, float | int]:
        duplicate_ratio = (
            self._duplicate_count / self._total_rows if self._total_rows > 0 else 0.0
        )
        fuzzy_pairs = self._compute_fuzzy_duplicates()
        return {
            "duplicate_count": self._duplicate_count,
            "duplicate_ratio": float(duplicate_ratio),
            "key_duplicate_counts": self._key_duplicate_counts,
            "fuzzy_duplicate_pairs": fuzzy_pairs,
        }

