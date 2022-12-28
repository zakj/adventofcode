import inspect
from itertools import zip_longest
from pathlib import Path


def _find_day_file():
    for frame in inspect.stack()[1:]:
        mod = inspect.getmodule(frame[0])
        f = Path(inspect.getmodule(frame[0]).__file__)
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


class Solver:
    def __init__(self, *parts, expect=None, suffix=""):
        self.parts = parts
        if expect is None:
            expect = []
        self.suffix = suffix
        self.expected = expect

    def __add__(self, other):
        return [self, other]

    def __iter__(self):
        return zip_longest(self.parts, self.expected)


def solve(*args, **kwargs):
    return Solver(*args, **kwargs)
