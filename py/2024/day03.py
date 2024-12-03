import re
from dataclasses import dataclass
from enum import Enum

from aoc import main


class Op(Enum):
    Mul = 1
    Do = 2
    Dont = 3


@dataclass
class Statement:
    start: int
    op: Op
    value: int = 0


mul_pattern = r"mul\((\d{1,3}),(\d{1,3})\)"


def multiply(s: str) -> int:
    matches = re.findall(mul_pattern, s)
    return sum(int(m[0]) * int(m[1]) for m in matches)


def multiply_with_enables(s: str) -> int:
    statements = [
        Statement(m.start(), Op.Mul, int(m.group(1)) * int(m.group(2)))
        for m in re.finditer(mul_pattern, s)
    ]
    statements.extend([Statement(m.start(), Op.Do) for m in re.finditer(r"do\(\)", s)])
    statements.extend(
        [Statement(m.start(), Op.Dont) for m in re.finditer(r"don't\(\)", s)]
    )
    statements.sort(key=lambda m: m.start)

    total = 0
    enabled = True
    for st in statements:
        if st.op == Op.Do:
            enabled = True
        elif st.op == Op.Dont:
            enabled = False
        elif st.op == Op.Mul and enabled:
            total += st.value

    return total


if __name__ == "__main__":
    main(multiply, multiply_with_enables)
