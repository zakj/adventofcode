import functools
import json
from queue import SimpleQueue
from typing import Any, NotRequired, TypedDict

from watchdog.utils import BaseThread
from websockets import ConnectionClosedError
from websockets.sync.server import ServerConnection, serve

WS_HOST = "localhost"
WS_PORT = 8765
WS_URL = f"ws://{WS_HOST}:{WS_PORT}"

# TODO: should I use websocket to deliver input as well?


# TODO: we could have aside be its own message. and add a status message for live-updating
class Aside(TypedDict):
    header: list[str]
    rows: list[list[str]]


class ResultMessage(TypedDict):
    answer: Any
    duration: float
    aside: NotRequired[Aside]


class CompleteMessage(TypedDict):
    complete: bool


Message = ResultMessage | CompleteMessage


def on_message(queue: SimpleQueue[Message], websocket: ServerConnection) -> None:
    try:
        for message in websocket:
            queue.put(json.loads(message))
        queue.put({"complete": True})
    except ConnectionClosedError:
        # Sometimes we kill the solver program before it can cleanly disconnect.
        pass


class WebsocketThread(BaseThread):
    queue: SimpleQueue[Message]

    def __init__(self):
        super().__init__()
        self.queue = SimpleQueue()

    def run(self) -> None:
        handler = functools.partial(on_message, self.queue)
        with serve(handler, WS_HOST, WS_PORT) as server:
            self.server = server
            server.serve_forever()

    def on_thread_stop(self) -> None:
        self.server.shutdown()
