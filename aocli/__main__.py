import argparse
import os
import sys
from pathlib import Path

from watchdog.observers import Observer

from . import BASE_DIR, RUNNERS
from .event_handler import Handler
from .run import Runner
from .websocket import WebsocketThread

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

websocket_thread = WebsocketThread()
websocket_thread.start()
runner = Runner(websocket_thread)

if args.watch:
    patterns = [f"*{ext}" for ext in RUNNERS.keys()]
    handler = Handler(runner=runner, patterns=patterns)
    observer = Observer()
    observer.schedule(handler, path, recursive=True)
    observer.start()
    try:
        websocket_thread.join()
    except KeyboardInterrupt:
        pass
    finally:
        websocket_thread.stop()
        websocket_thread.join()
        observer.stop()
        observer.join()
else:
    runner.run(args.path)
    websocket_thread.stop()
