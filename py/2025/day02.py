import re
from collections.abc import Iterable

from aoc import main
from aoc.parse import all_numbers
from aoc.util import chunks

repeated_twice_re = re.compile(r"^(\d+)\1$")
repeated_re = re.compile(r"^(\d+)\1+$")


def parse(input: str) -> Iterable[int]:
    values = []
    for start, end in chunks(all_numbers(input.replace("-", " ")), 2):
        values.extend(range(start, end + 1))
    return values


if __name__ == "__main__":
    main(
        lambda s: sum(x for x in parse(s) if repeated_twice_re.match(str(x))),
        lambda s: sum(x for x in parse(s) if repeated_re.match(str(x))),
    )
