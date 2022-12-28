from pathlib import Path
import subprocess
import sys
import time

from watchdog.observers import Observer
from watchdog.events import PatternMatchingEventHandler


class Handler(PatternMatchingEventHandler):
    process: subprocess.Popen | None = None

    def on_created_or_modified(self, event):
        src = Path(event.src_path)
        if not src.name.startswith("day"):
            # TODO: ensure correct parent path
            days = Path(__file__).parent.parent.rglob("day*.py")
            src = max(days, key=lambda f: f.stat().st_ctime)

        if self.process:
            if self.process.poll() is None:
                self.process.terminate()
                try:
                    self.process.wait(timeout=1)
                except subprocess.TimeoutExpired:
                    self.process.kill()
            print()
        self.process = subprocess.Popen(["python", "bin/runner.py", src])

    on_created = on_created_or_modified
    on_modified = on_created_or_modified


if __name__ == "__main__":
    path = sys.argv[1] if len(sys.argv) > 1 else "."  # TODO
    event_handler = Handler(patterns=["*.py"])
    observer = Observer()
    observer.schedule(event_handler, path, recursive=True)
    observer.start()
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        pass
    finally:
        observer.stop()
        observer.join()
