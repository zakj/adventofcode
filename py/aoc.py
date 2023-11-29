import cProfile
import inspect
import json
import pstats
import sys
import time
from collections.abc import Callable
from pathlib import Path
from typing import Any

import numpy as np
from websockets.sync.client import connect

FILE_SEP = chr(28)
RECORD_SEP = chr(30)


class ResultsEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, np.integer):
            return int(obj)
        return super().default(obj)


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


def main(*fns: Callable[..., Any], profile: int = -1):
    files = []
    for chunk in sys.stdin.read().split(FILE_SEP):
        split = chunk.split(RECORD_SEP, 2)
        files.append((split[0], json.loads(split[1]) if len(split) > 1 else {}))

    try:
        if len(sys.argv) == 1:
            input, args = files[0]
            for fn in fns:
                print(fn(input, **args))
        else:
            with connect(sys.argv[1]) as websocket:
                for input, args in files:
                    for i, fn in enumerate(fns):
                        sig = inspect.signature(fn)
                        kwargs = {k: v for k, v in args.items() if k in sig.parameters}
                        response = {}
                        prof = None
                        if profile == i:
                            prof = cProfile.Profile()
                            start = time.perf_counter()
                            prof.enable()
                            response["answer"] = fn(input, **kwargs)
                            prof.disable()
                            response["duration"] = time.perf_counter() - start
                            response["aside"] = create_profile_table(
                                prof, _find_day_file()
                            )
                        else:
                            start = time.perf_counter()
                            # TODO: catch and handle exceptions here so we don't abort the whole run
                            response["answer"] = fn(input, **kwargs)
                            response["duration"] = time.perf_counter() - start
                        websocket.send(json.dumps(response, cls=ResultsEncoder))
    except KeyboardInterrupt:
        pass
