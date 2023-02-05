import argparse
import os
import sys
import time
from pathlib import Path

from watchdog.observers import Observer

from . import BASE_DIR, RUNNERS
from .event_handler import Handler
from .run import Runner

# TODO: is there a better way?
os.environ["PYTHONPATH"] = str(BASE_DIR / "py")


parser = argparse.ArgumentParser(prog="aocli", description="CLI for AOC solutions.")

group = parser.add_mutually_exclusive_group()
group.add_argument(
    "-w",
    "--watch",
    action="store_true",
    help="watch for changed files and run the most recent",
)
group.add_argument(
    "path",
    nargs="?",
    help="relative path to either a year's directory or a single day's file",
    default=str(BASE_DIR),
)

args = parser.parse_args()

path = Path(args.path).resolve()
if not path.exists():
    print(f"path not found: {path}", file=sys.stderr)
    parser.print_usage()
    sys.exit(1)


runner = Runner()
try:
    if args.watch:
        handler = Handler(runner=runner, patterns=[f"*{ext}" for ext in RUNNERS.keys()])
        observer = Observer()
        observer.schedule(handler, path, recursive=True)
        observer.start()
        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            pass
        finally:
            observer.stop()
            observer.join()
    else:
        if path.is_file():
            runner.run_file(path)
        else:
            runner.run_dir(path)
except KeyboardInterrupt:
    runner.cancel()
