import operator
import sys

from aoc import main
from aoc.parse import line_parser

OPS = {
    "+": operator.add,
    "-": operator.sub,
    "*": operator.mul,
    "/": operator.truediv,
}


@line_parser
def parse(line: str) -> tuple[str, int | str]:
    name, expr = line.split(": ")
    return name, (int(expr) if expr.isdigit() else expr)


def yell(name: str, monkeys: dict[str, int | str]) -> int:
    val = monkeys[name]
    if isinstance(val, int):
        return val
    left, op, right = val.split(" ")
    return OPS[op](yell(left, monkeys), yell(right, monkeys))


def human_yell(monkeys: dict[str, int | str]) -> int:
    assert isinstance(monkeys["root"], str)
    a, _, b = monkeys["root"].split(" ")
    zero = yell(a, dict(monkeys, humn=0))
    one = yell(a, dict(monkeys, humn=1))
    op = operator.gt if one > zero else operator.lt
    lo = -sys.maxsize
    hi = sys.maxsize
    while True:
        humn = (hi + lo) // 2
        val_a = yell(a, dict(monkeys, humn=humn))
        val_b = yell(b, dict(monkeys, humn=humn))
        if val_a == val_b:
            return humn
        elif op(val_a, val_b):
            hi = humn
        else:
            lo = humn


if __name__ == "__main__":
    main(
        lambda s: int(yell("root", dict(parse(s)))),
        lambda s: human_yell(dict(parse(s))),
    )
