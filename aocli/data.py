import os
import tomllib
from dataclasses import dataclass
from pathlib import Path
from typing import Literal
from urllib.request import Request, urlopen

from . import BASE_DIR

# TODO: replace with aocd <https://github.com/wimglenn/advent-of-code-data>
# ... although it doesn't cache correct answers, so we still need tomls


@dataclass
class Input:
    answers: list
    args: dict
    input: str


@dataclass
class Example(Input):
    part: Literal[1] | Literal[2] | None = None


@dataclass
class Data:
    main: Input
    examples: list[Example]


def load_data(path: Path) -> Data:
    year = path.parent.name
    day = path.stem.removeprefix("day")
    data_file = BASE_DIR / "data" / year / f"{day}.toml"
    if not data_file.exists():
        write_data_skeleton(data_file, fetch_input(year, day))
    with open(data_file, "rb") as f:
        data = tomllib.load(f)
    m = data["main"]
    main = Input(m.get("answers", []), m.get("args", {}), m["input"])
    examples = [
        Example(ex.get("answers", []), ex.get("args", {}), ex["input"], ex.get("part"))
        for ex in data.get("examples", [])
    ]
    return Data(main, examples)


def write_data_skeleton(path: Path, input: str) -> None:
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w") as f:
        f.write("[main]\n")
        f.write("answers = []\n")
        f.write(f"input = '''\n{input}'''")


def fetch_input(year: str, day: str) -> str:
    with open(BASE_DIR / ".session") as f:
        session = f.read().strip()
    req = Request(f"https://adventofcode.com/{year}/day/{int(day)}/input")
    req.add_header("Cookie", f"session={session}")
    return urlopen(req).read().decode("utf8")
