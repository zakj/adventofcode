import cProfile
import inspect
import json
import pstats
import sys
import time
import traceback
from collections.abc import Callable
from itertools import count
from pathlib import Path
from typing import Any

from websockets.sync.client import connect


class ResultsEncoder(json.JSONEncoder):
    def default(self, o):
        # Currently does nothing different from superclass, but here just in case.
        # if isinstance(o, np.integer):
        #     return int(o)
        return super().default(o)


def _find_day_file():
    for frame in inspect.stack()[1:]:
        mod = inspect.getmodule(frame[0])
        if mod is None or mod.__file__ is None:
            continue
        f = Path(mod.__file__)
        if f.stem.startswith("day"):
            return f
    raise RuntimeError("no day file found in stack")


def create_profile_table(profile: cProfile.Profile, src_path: Path):
    def line(p: pstats.FunctionProfile):
        name = Path(p.file_name)
        if p.file_name == "~":
            return p.file_name
        if name == src_path:
            return str(p.line_number)
        if name.is_relative_to(base_dir):
            name = name.relative_to(base_dir)
        else:
            lib = next((d for d in sys.path if name.is_relative_to(d)), None)
            if lib:
                name = "/" / name.relative_to(lib)
        return f"{name}:{p.line_number}"

    base_dir = Path(__file__).parent.parent
    profile.create_stats()
    profiles = pstats.Stats(profile).get_stats_profile().func_profiles
    items = sorted(
        profiles.items(), key=lambda np: (np[1].tottime, np[1].ncalls), reverse=True
    )

    return {
        "header": ["line", "function", "total time", "calls"],
        "rows": [[line(p), name, str(p.tottime), p.ncalls] for name, p in items[:5]],
    }


def run_solver(fn, input, **kwargs):
    response = {}
    start = time.perf_counter()
    try:
        response["answer"] = fn(input, **kwargs)
        response["duration"] = time.perf_counter() - start
    except Exception:
        traceback.print_exc()
        response["error"] = True
    return response


_websocket = None


def main(*fns: Callable[..., Any], profile: int = -1, isolate: int | None = None):
    global _websocket
    try:
        if len(sys.argv) == 1:
            input = sys.stdin.read()
            for fn in fns:
                print(fn(input))
        else:
            with connect(sys.argv[1]) as websocket:
                _websocket = websocket
                for msg_index in count():
                    msg = json.loads(websocket.recv())
                    if msg.get("done"):
                        break
                    input, args, part = msg["input"], msg["args"], msg.get("part")
                    for i, fn in enumerate(fns):
                        if part and i + 1 != part:
                            continue
                        if isolate is not None and isolate != msg_index:
                            websocket.send(
                                json.dumps({"answer": "skipped", "duration": 0})
                            )
                            continue
                        sig = inspect.signature(fn)
                        kwargs: dict[str, Any] = {
                            k: v for k, v in args.items() if k in sig.parameters
                        }
                        if profile == i:
                            prof = cProfile.Profile()
                            prof.enable()
                            response = run_solver(fn, input, **kwargs)
                            prof.disable()
                            response["aside"] = create_profile_table(
                                prof, _find_day_file()
                            )
                        else:
                            response = run_solver(fn, input, **kwargs)
                        websocket.send(json.dumps(response, cls=ResultsEncoder))
                    websocket.send(json.dumps({"done": True}, cls=ResultsEncoder))
                _websocket = None
    except KeyboardInterrupt:
        pass


def status(msg: str) -> None:
    if _websocket is not None:
        _websocket.send(json.dumps({"status": msg}))
