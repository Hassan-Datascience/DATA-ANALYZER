from collections.abc import Generator
from typing import List, Tuple
import os
import logging
import pandas as pd

from app.core.config import settings

logger = logging.getLogger(__name__)

class DataProcessor:
    """
    Universal data utility to stream CSV, JSON, or XLSX files using pandas.
    """

    def __init__(self, file_path: str):
        self.file_path = file_path
        self.chunk_size = settings.csv_chunk_size
        self.extension = os.path.splitext(file_path)[1].lower()
        
        logger.info(
            "Initializing DataProcessor file_path=%s ext=%s chunk_size=%d",
            self.file_path,
            self.extension,
            self.chunk_size,
        )

    def iter_chunks(self) -> Generator[pd.DataFrame, None, None]:
        """
        Iterate over the file yielding DataFrame chunks.
        """
        try:
            if self.extension == '.csv':
                reader = pd.read_csv(
                    self.file_path,
                    chunksize=self.chunk_size,
                    iterator=True,
                    dtype=object,
                    on_bad_lines="warn",
                )
                for chunk in reader:
                    yield chunk
            
            elif self.extension == '.json':
                # For JSON, we might have different formats. Assuming records format.
                # read_json doesn't support chunksize directly for all orientations.
                # If it's small (max 5MB), we can read all and yield.
                df = pd.read_json(self.file_path, orient='records', dtype=object)
                for i in range(0, len(df), self.chunk_size):
                    yield df.iloc[i:i + self.chunk_size]
            
            elif self.extension == '.xlsx':
                # Similar to JSON, read_excel doesn't support chunksize.
                df = pd.read_excel(self.file_path, dtype=object)
                for i in range(0, len(df), self.chunk_size):
                    yield df.iloc[i:i + self.chunk_size]
            
            else:
                raise ValueError(f"Unsupported file format: {self.extension}")
                
        except Exception as e:
            logger.error(f"Failed to process data stream: {e}")
            raise

    def get_basic_stats(self) -> Tuple[int, List[str]]:
        """
        Return total row count and column names.
        """
        total_rows = 0
        columns: List[str] = []
        for i, chunk in enumerate(self.iter_chunks()):
            if i == 0:
                columns = list(chunk.columns)
            total_rows += len(chunk)
        return total_rows, columns
