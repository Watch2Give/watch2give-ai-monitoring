import logging
from logging.handlers import RotatingFileHandler
from pathlib import Path

def setup_logger(name: str, log_dir: str, log_file: str, level=logging.INFO):
    # Ensure the log directory exists
    log_path = Path("logs") / log_dir
    log_path.mkdir(parents=True, exist_ok=True)

    logger = logging.getLogger(name)
    logger.setLevel(level)

    # Avoid duplicate handlers if logger is reused
    if not logger.handlers:
        log_file_path = log_path / log_file
        file_handler = RotatingFileHandler(log_file_path, maxBytes=5_000_000, backupCount=3)
        formatter = logging.Formatter('%(asctime)s [%(levelname)s] %(message)s')
        file_handler.setFormatter(formatter)
        logger.addHandler(file_handler)

    return logger
