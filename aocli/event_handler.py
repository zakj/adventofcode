import threading
import time

from watchdog.events import FileModifiedEvent, PatternMatchingEventHandler

from .run import Runner


class Handler(PatternMatchingEventHandler):
    runner: Runner
    prev: tuple[str, float]

    def __init__(self, *args, runner: Runner, **kwargs):
        self.runner = runner
        self.prev = ("", 0)
        super().__init__(*args, **kwargs)

    def on_modified(self, event: FileModifiedEvent) -> None:
        # Debounce.
        prev_src, prev_time = self.prev
        now = time.time()
        if event.src_path == prev_src and now - prev_time < 0.2:
            return
        self.prev = (event.src_path, now)

        threading.Thread(target=self.runner.run, args=[event.src_path]).start()
