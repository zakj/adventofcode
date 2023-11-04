import json
import os
import subprocess
import tempfile
import threading
from contextlib import contextmanager
from itertools import groupby
from pathlib import Path
from typing import IO, Any, Iterable, NotRequired, TypedDict

from rich.console import Console

from . import BASE_DIR, RUNNERS
from .data import Input, load_data
from .ui import Aside, Day, Year

FILE_SEP = chr(28)
RECORD_SEP = chr(30)


# TODO: we could have aside be its own message. and add a status message for live-updating
class Message(TypedDict):
    answer: Any
    duration: float
    aside: NotRequired[Aside]


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

    def __init__(self, fd: IO[str], console: Console):
        self.fd = fd
        self.console = console
        super().__init__()

    def run(self):
        for line in self.fd:
            self.console.print(line.rstrip())


class Runner:
    def __init__(self):
        self._cancel = threading.Lock()
        self.proc = None
        self.tempdir = tempfile.TemporaryDirectory(prefix="aocli-")
        self.pipe = Path(self.tempdir.name) / "pipe"
        os.mkfifo(self.pipe)
        self.ui = None

    def __del__(self):
        self.tempdir.cleanup()

    def cancel(self):
        self._cancel.acquire()
        if self.ui:
            self.ui.quit()
        if self.proc and self.proc.poll() is None:
            self.proc.terminate()
            self.proc.wait()

    def resume(self):
        self._cancel.release()

    def messages(self) -> Iterable[Message]:
        with open(self.pipe, "r") as f:
            for line in f:
                yield json.loads(line)

    def run_dir(self, path: Path) -> None:
        files = [f for suffix in RUNNERS.keys() for f in path.rglob(f"day??{suffix}")]
        files.sort()
        for year, days in groupby(files, lambda f: f.parent.name):
            with Year(year) as ui:
                for path in days:
                    day = path.stem.removeprefix("day")
                    ui.start_day(day)
                    data = load_data(year, day)
                    args = [x.format(path) for x in RUNNERS[path.suffix].split()]
                    args.append(str(self.pipe))
                    self.run_parts(args, data.main, ui)

    def run_file(self, path: Path) -> None:
        if path.suffix not in RUNNERS:
            raise ValueError(f"unknown file extension: {path.suffix}")
        if not path.name.startswith("day"):
            days = BASE_DIR.rglob(f"day*{path.suffix}")
            path = max(days, key=lambda f: f.stat().st_ctime)

        year = path.parent.name
        day = path.stem.removeprefix("day")

        data = load_data(year, day)
        args = [x.format(path) for x in RUNNERS[path.suffix].split()]
        args.append(str(self.pipe))
        with Day(f"{year}/{day}.{path.suffix[1:]}") as self.ui:
            with self.ui.examples:
                for example in data.examples:
                    self.run_parts(args, example, self.ui)
            self.run_parts(args, data.main, self.ui)
        self.ui = None

    # TODO: take list of inputs, maybe with example flag?
    def run_parts(self, args: list[str], input: Input, ui: Day | Year):
        with input_fd(input) as stdin:
            if not self._cancel.acquire(blocking=False):
                return
            self.proc = subprocess.Popen(
                args,
                stdin=stdin,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
            )
            self._cancel.release()
        assert self.proc.stdout is not None  # for type system
        stdout = StdoutThread(self.proc.stdout, ui.live.console)
        stdout.start()

        answers = iter(input.answers)
        for msg in self.messages():
            if "answer" in msg and "duration" in msg:
                expected = next(answers, None)
                ui.complete(msg["answer"], expected, msg["duration"])
            if "aside" in msg:
                ui.aside(msg["aside"])

        if self.proc.wait() != 0:
            ui.error()
        stdout.join()
