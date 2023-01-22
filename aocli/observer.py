import subprocess
import tempfile
import threading
import time
from pathlib import Path
from typing import IO

import yaml
from rich.console import Console
from watchdog.events import PatternMatchingEventHandler

from . import BASE_DIR, RUNNERS
from .comm import Socket, SocketClosed
from .ui import Day


class StdoutThread(threading.Thread):
    fd: IO[str]
    console: Console

    def __init__(self, fd: IO[str], console: Console):
        self.fd = fd
        self.console = console
        super().__init__()

    def run(self):
        for line in self.fd:
            self.console.print(line.strip())


class RunThread(threading.Thread):
    data_file: Path
    proc: subprocess.Popen | None
    proc_lock: threading.Lock
    socket: Socket
    src: Path
    ui: Day

    def __init__(self, src: str, socket):
        path = Path(src)
        if not path.name.startswith("day"):
            days = [f for ext in RUNNERS.keys() for f in BASE_DIR.rglob(f"day*{ext}")]
            path = max(days, key=lambda f: f.stat().st_ctime)
        self.src = path
        year = self.src.parent.name
        day = self.src.stem.removeprefix("day")
        self.data_file = BASE_DIR / "data" / year / f"{day}.yml"
        self.proc = None
        self.proc_lock = threading.Lock()
        self.socket = socket
        self.ui = Day(f"{year}/{day}.{self.src.suffix[1:]}")
        super().__init__()

    def quit(self):
        self.proc_lock.acquire()
        self.ui.quit()
        if self.proc and self.proc.poll() is None:
            self.proc.terminate()
            try:
                self.proc.wait(timeout=1)
            except subprocess.TimeoutExpired:
                self.proc.kill()

    def run_parts(self, answers, input, example=False):
        with tempfile.NamedTemporaryFile("w") as tmp:
            tmp.write(input)
            tmp.flush()
            with open(tmp.file.name, "r") as stdin:
                args = [x.format(self.src) for x in RUNNERS[self.src.suffix].split(" ")]
                args.append(self.socket.address)
                # `quit` can be called from another thread, so there's a race here.
                if not self.proc_lock.acquire(blocking=False):
                    return
                self.proc = subprocess.Popen(
                    args,
                    stdin=stdin,
                    stdout=subprocess.PIPE,
                    text=True,
                )
                self.proc_lock.release()

            assert self.proc.stdout is not None
            stdout_thread = StdoutThread(self.proc.stdout, self.ui.live.console)
            stdout_thread.start()

            try:
                msg_count = self.socket.msg_count()
                if msg_count < 1:
                    return
                for part in range(1, msg_count + 1):
                    self.ui.start(part, example)
                    msg = self.socket.msg()
                    expected = answers[part - 1] if part <= len(answers) else None
                    self.ui.complete(msg["result"], expected, msg["duration"])
            except SocketClosed:
                pass
            stdout_thread.join()

    def run(self):
        with open(self.data_file) as f:
            data = yaml.load(f, yaml.Loader)
        with self.ui:
            for example in data["examples"]:
                self.run_parts(example["answers"], example["input"], example=True)
            if data["examples"]:
                self.ui.end_examples()
            self.run_parts(data["answers"], data["input"])


class Handler(PatternMatchingEventHandler):
    cancel: threading.Event
    first_run: bool
    socket: Socket
    tempdir: tempfile.TemporaryDirectory
    thread: RunThread | None

    def __init__(self, *args, **kwargs):
        self.cancel = threading.Event()
        self.first_run = True
        self.tempdir = tempfile.TemporaryDirectory(suffix="-aoc")
        self.socket = Socket(self.tempdir.name + "/sock", cancel=self.cancel)
        self.thread = None
        self.prev = (None, 0)
        super().__init__(*args, **kwargs)

    def __del__(self):
        self.tempdir.cleanup()

    def on_created_or_modified(self, event):
        # Debounce.
        prev_src, prev_time = self.prev
        now = time.time()
        if event.src_path == prev_src and now - prev_time < 0.2:
            return
        self.prev = (event.src_path, now)

        # Cancel any existing run.
        if self.thread and self.thread.is_alive():
            self.cancel.set()
            self.thread.quit()
            self.thread.join()

        if self.first_run:
            self.first_run = False
        else:
            print()  # newline between runs
        self.thread = RunThread(event.src_path, self.socket)
        self.thread.start()

    on_created = on_created_or_modified
    on_modified = on_created_or_modified
