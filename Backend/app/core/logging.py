import logging
import sys

from .config import settings


def setup_logging() -> None:
    """
    Configure application-wide logging.

    This is intentionally simple and compatible with uvicorn's logging setup.
    """

    root_logger = logging.getLogger()
    if root_logger.handlers:
        # Assume logging already configured (e.g. by uvicorn)
        return

    log_level = getattr(logging, settings.log_level.upper(), logging.INFO)

    handler = logging.StreamHandler(sys.stdout)
    formatter = logging.Formatter(
        fmt="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )
    handler.setFormatter(formatter)

    root_logger.setLevel(log_level)
    root_logger.addHandler(handler)

