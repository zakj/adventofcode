import json
import threading
from collections.abc import Callable
from contextlib import contextmanager
from itertools import groupby
from pathlib import Path
from queue import Empty, SimpleQueue
from subprocess import PIPE, STDOUT, Popen
from typing import IO
from urllib.error import HTTPError

from rich.console import Console
from websockets import ConnectionClosedError

from . import BASE_DIR, RUNNERS
from .data import Input, load_data
from .ui import BaseUI, Day, Year
from .websocket import Message, WebsocketThread


class NoWebsocketConnection(Exception):
    pass


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
    proc: Popen | None
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
                inputs = load_data(path)
                with Day(path) as ui, self.spawn(path, ui) as (send, messages):
                    for input in inputs:
                        if not input.is_example:
                            ui.finish_examples()
                        self.process_input(input, ui, send, messages)
                    send(json.dumps({"done": True}))
            elif path.is_dir():
                files = sorted(f for suffix in RUNNERS.keys() for f in path.rglob(f"day??{suffix}"))
                for year, days in groupby(files, lambda f: f.parent.name):
                    with Year(year) as ui:
                        for path in days:
                            with self.spawn(path, ui) as (send, messages):
                                ui.start_day(path.stem.removeprefix("day"))
                                input = load_data(path)[-1]
                                self.process_input(input, ui, send, messages)
                                send(json.dumps({"done": True}))
        except (ConnectionClosedError, KeyboardInterrupt):
            pass
        except HTTPError as err:
            print("*** unable to fetch data:", err)
        except NoWebsocketConnection:
            print("*** runner never got a websocket connection; giving up")
        finally:
            self.running.release()

    @contextmanager
    def spawn(self, path, ui: BaseUI):
        args = [x.format(path) for x in RUNNERS[path.suffix].split()]
        args.append(self.ws_thread.url)
        self.proc = proc = Popen(args, stdout=PIPE, stderr=STDOUT, text=True)
        assert proc.stdout is not None
        stdout = StdoutThread(proc.stdout, ui.live.console)
        stdout.start()
        try:
            send, messages = self.ws_thread.queue.get(timeout=1)
            yield send, messages
        except Empty:
            raise NoWebsocketConnection()
        finally:
            if proc.wait() != 0:
                ui.error()
                stdout.quit()
            stdout.join()

    def process_input(
        self,
        input: Input,
        ui: BaseUI,
        send: Callable[[str], None],
        messages: SimpleQueue[Message],
    ):
        msg = {"args": input.args, "input": input.input, "part": input.part}
        send(json.dumps(msg))
        answers = iter(input.answers)
        while (self.proc and self.proc.poll() is None) or not messages.empty():
            try:
                msg = messages.get(timeout=0.2)
            except Empty:
                continue

            if "done" in msg:
                break
            elif "error" in msg:
                ui.error()
            elif "status" in msg:
                ui.status(msg["status"])
            elif "answer" in msg and "duration" in msg:
                expected = next(answers, None)
                ui.complete(msg["answer"], expected, msg["duration"])
                ui.start_run()
                if "aside" in msg:
                    ui.aside(msg["aside"])
