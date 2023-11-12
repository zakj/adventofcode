import os
import tomllib
from dataclasses import dataclass
from pathlib import Path
from urllib.request import Request, urlopen

from . import BASE_DIR


@dataclass
class Input:
    answers: list
    args: dict
    input: str


@dataclass
class Data:
    main: Input
    examples: list[Input]


def load_data(year: str, day: str) -> Data:
    data_file = BASE_DIR / "data" / year / f"{day}.toml"
    if not data_file.exists():
        write_data_skeleton(data_file, fetch_input(year, day))
    with open(data_file, "rb") as f:
        data = tomllib.load(f)
    main_data = data["main"]
    main = Input(
        main_data.get("answers", []), main_data.get("args", {}), main_data["input"]
    )
    examples = [
        Input(ex.get("answers", []), ex.get("args", {}), ex["input"])
        for ex in data.get("examples", [])
    ]
    return Data(main, examples)


def write_data_skeleton(path: Path, input: str):
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
