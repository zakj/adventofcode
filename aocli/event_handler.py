import threading
import time
from pathlib import Path

from watchdog.events import (
    FileCreatedEvent,
    FileModifiedEvent,
    PatternMatchingEventHandler,
)

from .run import Runner


class Handler(PatternMatchingEventHandler):
    runner: Runner
    prev: tuple[str, float]
    thread: threading.Thread | None

    def __init__(self, *args, runner: Runner, **kwargs):
        self.runner = runner
        self.prev = ("", 0)
        self.thread = None
        super().__init__(*args, **kwargs)

    def on_created_or_modified(
        self, event: FileCreatedEvent | FileModifiedEvent
    ) -> None:
        # Debounce.
        prev_src, prev_time = self.prev
        now = time.time()
        if event.src_path == prev_src and now - prev_time < 0.2:
            return
        self.prev = (event.src_path, now)

        # Cancel any existing run.
        if self.thread and self.thread.is_alive():
            self.runner.cancel()
            self.thread.join()
            self.runner.resume()

        # Newline between subsequent runs.
        if prev_src:
            print()

        self.thread = threading.Thread(
            target=lambda: self.runner.run_file(Path(event.src_path))
        )
        self.thread.start()

    on_created = on_created_or_modified
    on_modified = on_created_or_modified
