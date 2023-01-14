import inspect
from collections import namedtuple
from itertools import zip_longest
from pathlib import Path

Solver = namedtuple("Solver", "fn expected path suffix should_profile")


def _find_day_file():
    for frame in inspect.stack()[1:]:
        mod = inspect.getmodule(frame[0])
        if mod is None or mod.__file__ is None:
            continue
        f = Path(mod.__file__)
        if f.stem.startswith("day"):
            return f
    raise RuntimeError("no day file found in stack")


def get_year_day(f: Path) -> tuple[str, str]:
    year = f.parent.stem
    day = "".join((c for c in f.stem if str.isdigit(c)))
    return year, day


def load(suffix: str = "", day_file: Path | None = None) -> str:
    if day_file is None:
        day_file = _find_day_file()
    year, day = get_year_day(day_file)

    # TODO: factor out to top-level input dir
    input_dir = day_file.resolve().parent.parent.parent / year / "input"
    return (input_dir / f"{day}{suffix}.txt").read_text()


def solve(*parts, expect=(), profile=None, suffix=""):
    path = _find_day_file()
    return [
        Solver(fn, expected, path, suffix, i == profile)
        for i, (fn, expected) in enumerate(zip_longest(parts, expect[: len(parts)]))
    ]
