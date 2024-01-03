import json
import subprocess
import tempfile
import threading
from contextlib import contextmanager
from itertools import groupby
from pathlib import Path
from queue import Empty
from typing import IO

from rich.console import Console

from . import BASE_DIR, RUNNERS
from .data import Example, Input, load_data
from .ui import Day, Year
from .websocket import WebsocketThread

FILE_SEP = chr(28)
RECORD_SEP = chr(30)


@contextmanager
def input_fd(input: Input):
    with tempfile.TemporaryFile("w+") as tmp:
        tmp.write(input.input)
        if input.args:
            tmp.write(RECORD_SEP)
            tmp.write(json.dumps(input.args))
        tmp.seek(0)
        yield tmp


class StdoutThread(threading.Thread):
    fd: IO[str]
    console: Console
    _quit_event: threading.Event

    def __init__(self, fd: IO[str], console: Console):
        super().__init__()
        self.fd = fd
        self.console = console
        self._quit_event = threading.Event()

    def quit(self):
        self._quit_event.set()

    def run(self):
        for line in self.fd:
            if self._quit_event.is_set():
                break
            self.console.print(line.rstrip())


def most_recently_modified(path: Path) -> Path:
    if not path.name.startswith("day"):
        days = BASE_DIR.rglob(f"day*{path.suffix}")
        return max(days, key=lambda f: f.stat().st_ctime)
    return path


class Runner:
    ws_thread: WebsocketThread
    proc: subprocess.Popen | None
    running: threading.Lock

    def __init__(self, ws_thread: WebsocketThread) -> None:
        self.ws_thread = ws_thread
        self.proc = None
        self.running = threading.Lock()

    def run(self, filename: str) -> None:
        if not self.running.acquire(blocking=False):
            if self.proc and self.proc.poll() is None:
                self.proc.terminate()
                self.proc.wait()
            if not self.running.acquire(timeout=0.2):
                print("*** runner lock is stuck; giving up")
                return

        # Newline between runs.
        if self.proc:
            print()

        try:
            path = Path(filename).resolve()
            if path.is_file():
                path = most_recently_modified(path)
                try:
                    data = load_data(path)
                except Exception as err:
                    print("*** unable to fetch data:", err)
                    self.running.release()
                    return
                with Day(path) as ui:
                    with ui.examples:
                        for example in data.examples:
                            self.spawn(path, ui, example)
                    self.spawn(path, ui, data.main)
            elif path.is_dir():
                files = sorted(
                    f for suffix in RUNNERS.keys() for f in path.rglob(f"day??{suffix}")
                )
                for year, days in groupby(files, lambda f: f.parent.name):
                    with Year(year) as ui:
                        # TODO: what if we try to cancel here?
                        for path in days:
                            ui.start_day(path.stem.removeprefix("day"))
                            data = load_data(path)
                            self.spawn(path, ui, data.main)
        except KeyboardInterrupt:
            pass
        finally:
            self.running.release()

    def spawn(self, path: Path, ui: Day | Year, input: Input) -> None:
        args = [x.format(path) for x in RUNNERS[path.suffix].split()] + [
            self.ws_thread.url
        ]
        self.proc = proc = subprocess.Popen(
            args,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
        )
        assert proc.stdout is not None  # for type system
        stdout = StdoutThread(proc.stdout, ui.live.console)
        stdout.start()

        try:
            send, messages = self.ws_thread.queue.get(timeout=1)
        except Empty:
            # TODO better handling here; check self.proc etc
            print("*** runner never got a websocket connection; giving up")
            return

        msg = {
            "args": input.args,
            "input": input.input,
        }
        if isinstance(input, Example):
            msg["part"] = input.part
        send(json.dumps(msg))  # TODO can get ConnectionClosedError here—why
        answers = iter(input.answers)
        while proc.poll() is None or not messages.empty():
            try:
                msg = messages.get(timeout=0.2)
            except Empty:
                continue

            if msg.get("done"):
                break
            if "answer" in msg and "duration" in msg:
                expected = next(answers, None)
                ui.complete(msg["answer"], expected, msg["duration"])
            if "aside" in msg:
                ui.aside(msg["aside"])

        if proc.wait() != 0:
            ui.error()
        stdout.quit()
        stdout.join()
