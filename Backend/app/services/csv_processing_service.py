from collections.abc import Generator
from typing import List, Tuple

import logging
import pandas as pd

from app.core.config import settings


logger = logging.getLogger(__name__)


class CsvChunkProcessor:
    """
    Utility service to stream a CSV file in chunks using pandas.
    """

    def __init__(self, file_path: str):
        self.file_path = file_path
        self.chunk_size = settings.csv_chunk_size
        # Log the configured chunk size for traceability in audit flows.
        logger.info(
            "Initializing CsvChunkProcessor file_path=%s chunk_size=%d",
            self.file_path,
            self.chunk_size,
        )

    def iter_chunks(self) -> Generator[pd.DataFrame, None, None]:
        """
        Iterate over the CSV file yielding DataFrame chunks.

        Uses dtype=object to avoid unintended type coercion and on_bad_lines="warn"
        to gracefully handle malformed rows.
        """
        reader = pd.read_csv(
            self.file_path,
            chunksize=self.chunk_size,
            iterator=True,
            dtype=object,
            on_bad_lines="warn",
        )
        for chunk in reader:
            yield chunk

    def get_basic_stats(self) -> Tuple[int, List[str]]:
        """
        Return total row count and column names by iterating over all chunks.
        """
        total_rows = 0
        columns: List[str] = []
        for i, chunk in enumerate(self.iter_chunks()):
            if i == 0:
                columns = list(chunk.columns)
            total_rows += len(chunk)
        return total_rows, columns

