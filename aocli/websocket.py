import functools
import json
from collections.abc import Callable
from queue import SimpleQueue
from typing import Any, Literal, NotRequired, TypedDict

from watchdog.utils import BaseThread
from websockets import ConnectionClosedError
from websockets.sync.server import ServerConnection, serve


# TODO: we could have aside be its own message. and add a status message for live-updating
class Aside(TypedDict):
    header: list[str]
    rows: list[list[str]]


class ResultMessage(TypedDict):
    answer: Any
    duration: float
    aside: NotRequired[Aside]


class DoneMessage(TypedDict):
    done: Literal[True]


Message = ResultMessage | DoneMessage

Connection = tuple[Callable[[str], None], SimpleQueue[Message]]


def on_connection(queue: SimpleQueue[Connection], websocket: ServerConnection) -> None:
    messages = SimpleQueue()
    queue.put((websocket.send, messages))
    try:
        for message in websocket:
            messages.put(json.loads(message))
    except ConnectionClosedError:
        # Sometimes we kill the solver program before it can cleanly disconnect.
        pass


class WebsocketThread(BaseThread):
    host = "localhost"
    port = 8765
    queue: SimpleQueue[Connection]

    def __init__(self):
        super().__init__()
        self.queue = SimpleQueue()

    def run(self) -> None:
        handler = functools.partial(on_connection, self.queue)
        while True:
            try:
                with serve(handler, self.host, self.port) as server:
                    self.server = server
                    server.serve_forever()
                    break
            except OSError:
                self.port += 1

    def on_thread_stop(self) -> None:
        self.server.shutdown()

    @property
    def url(self) -> str:
        return f"ws://{self.host}:{self.port}"
