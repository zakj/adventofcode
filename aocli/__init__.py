"""
Each day's solver should expect to be called with a single command-line
argument: the URL to a websocket server. It should connect to that solver and
expect to receive one or more Input messages, followed by a Done message. For
each Input message, it should run its solvers on the input. For each solver, it
should emit a Results message.

When it has run all solvers on a given input, it should send a Done message to
indicate it is ready for another input, if any. When the server has exhausted
its inputs, it will send its own Done message, and the solver can safely exit.

Message formats:

    Input {
        "input": <string: Advent of Code input data for the day>,
        "args": <object?: key/value pairs for arguments to the solver>,
        "part": <int?: if the given input is relevant only for one part>,
    }

    Results {
        "answer": <any: the answer for that solver/input>,
        "duration": <float: time in seconds spent solving>,
        "aside": <Aside?: tabular profiling data>,
    }

    Aside {
        "header": <list of str: column names>,
        "rows": <list of list of str: cells>,
    }

    Done { "done": true }
"""

# TODO: Pull this out of the adventofcode repo into its own, and install it
# separately. Figure out how to configure RUNNERS separately as well.

from pathlib import Path

BASE_DIR = Path(__file__).parent.parent.resolve()

RUNNERS = {
    ".py": "python -u {}",
    ".ts": "pnpm ts-node --swc {}",
}
