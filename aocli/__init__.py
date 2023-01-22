from pathlib import Path

BASE_DIR = Path(__file__).parent.parent.resolve()

RUNNERS = {
    ".py": "python -u {}",
    ".ts": "pnpm ts-node --transpile-only {}",
}
