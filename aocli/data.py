import os
import re
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
    is_example: bool = False
    part: Literal[1] | Literal[2] | None = None


def load_data(path: Path) -> list[Input]:
    year = path.parent.name
    day = re.findall(r"\d+", path.stem.removeprefix("day"))[0]
    data_file = BASE_DIR / "data" / year / f"{day}.toml"
    if not data_file.exists():
        write_data_skeleton(data_file, fetch_input(year, day))
    with open(data_file, "rb") as f:
        data = tomllib.load(f)

    inputs = [
        Input(
            ex.get("answers", []),
            ex.get("args", {}),
            ex["input"],
            is_example=True,
            part=ex.get("part"),
        )
        for ex in data.get("examples", [])
    ]
    m = data["main"]
    inputs.append(Input(m.get("answers", []), m.get("args", {}), m["input"]))

    return inputs


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
