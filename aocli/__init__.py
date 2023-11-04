"""
Each "day" program should expect to be called with a single argument: the path
to a named pipe. On stdin, it should expect a series of inputs, each separated
by the ASCII file separator (0x1c). Each input contains is composed of two
parts: the input data itself, and an optional JSON object with required keyword
arguments for that input. The input data and JSON are separated by an ASCII
record separator (0x1e).

It should run its solvers on the input and write one message per solver to the
named pipe. Each message is a JSON object with a "results" key (of any type)
and a "duration" float (in seconds). Messages are delimited with a newline
character. The JSON object may optionally also contain an "aside" key, itself
an object with a "header" key (a list of strings), and a "rows" key (a list of
lists of strings). This will be displayed alongside the results.

TODO: Pull this out of the adventofcode repo into its own, and install it
separately. Figure out how to configure RUNNERS separately as well.
"""

from pathlib import Path

BASE_DIR = Path(__file__).parent.parent.resolve()

RUNNERS = {
    ".py": "python -u {}",
    ".ts": "pnpm ts-node --transpile-only {}",
}
