import json
import socket
import struct
import threading


class SocketClosed(Exception):
    pass


class Socket:
    address: str
    cancel: threading.Event
    sock: socket.socket
    s: socket.socket

    def __init__(self, address: str, cancel: threading.Event):
        self.sock = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
        self.sock.settimeout(0.5)
        self.address = address
        self.cancel = cancel
        self.sock.bind(self.address)
        self.sock.listen()

    def recv(self, length):
        response = self.s.recv(length)
        if len(response) != length:
            raise SocketClosed
        return response

    def _recv_length(self) -> int:
        return struct.unpack(">H", self.recv(2))[0]

    def msg_count(self):
        while True:
            try:
                self.s, _ = self.sock.accept()
                break
            except TimeoutError:
                if self.cancel.is_set():
                    raise SocketClosed
        return self._recv_length()

    def msg(self):
        length = self._recv_length()
        return json.loads(self.recv(length))
