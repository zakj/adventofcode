"""
Each "day" program should expect to be called with a single argument: the path
to a streaming Unix socket. On stdin, it should expect a series of inputs, each
separated by the ASCII file separator (0x1c). Each input contains is composed
of two parts: the input data itself, and an optional JSON object with required
keyword arguments for that input. The input data and JSON are separated by an
ASCII record separator (0x1e).

It should connect to the given socket to communicate its results. First, it
should send 2 big-endian bytes with the number of messages it expects to send
per input. Then it should run its solvers on the input, sending a results
message for each solver. The message begins with 2 big-endian bytes specifying
the size of the remainder of the message. The remainder is a JSON object with a
"results" key (of any type) and a "duration" float (in seconds)

The JSON object may optionally also contain an "extra" key, itself an object
with a "header" key (a list of strings), and a "rows" key (a list of lists of
strings). This will be displayed alongside the results.

TODO: This whole thing grew pretty organically and could probably use a
top-down re-evaluation. Maybe websockets for fun and to avoid having to send
sizes? Getting over-complicated because I'm trying to handle the simple case of
also just running a script with input on stdin. Maybe it's worth treating those
two cases separately: runners without an arg read single input from stdin, or
with a socket arg use a fancier protocol.

With a websocket-like interface we could maybe even move timings into the
runner, since we wouldn't have disk access to contend with.

server sends: {input, args}
client sends: {result, extra}
client sends: {result, extra}
client closes

"""

from pathlib import Path

BASE_DIR = Path(__file__).parent.parent.resolve()

RUNNERS = {
    ".py": "python -u {}",
    ".ts": "pnpm ts-node --transpile-only {}",
}
