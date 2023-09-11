import math
from collections import deque
from dataclasses import dataclass
from typing import Any, Callable, Iterable

from aoc import main
from parse import all_numbers, first_number, paras


@dataclass
class Monkey:
    items: deque[int]
    operation: Callable[[int], int]
    div_by: int
    target: dict[bool, int]
    inspections: int = 0


def make_op(s: str) -> Callable[[int], int]:
    _, op_str, rhs_str = s.split(" ")
    op: Callable[[Iterable[int]], int] = sum
    if op_str == "*":
        op = math.prod
    rhs = int(rhs_str) if rhs_str.isdigit() else None
    return lambda old: op([old, old if rhs is None else rhs])


def parse(s: str) -> list[Monkey]:
    return [
        Monkey(
            items=deque(all_numbers(lines[1])),
            operation=make_op(lines[2].split(" = ", 2)[1]),
            div_by=first_number(lines[3]),
            target={True: first_number(lines[4]), False: first_number(lines[5])},
        )
        for lines in paras(s)
    ]


def monkey_business(monkeys: list[Monkey], rounds: int, divisor: int = 3) -> int:
    lcm = math.lcm(*[m.div_by for m in monkeys])

    for _ in range(rounds):
        for monkey in monkeys:
            while monkey.items:
                monkey.inspections += 1
                worry = (monkey.operation(monkey.items.popleft()) % lcm) // divisor
                target = monkey.target[worry % monkey.div_by == 0]
                monkeys[target].items.append(worry)

    return math.prod(sorted((m.inspections for m in monkeys), reverse=True)[:2])


if __name__ == "__main__":
    main(
        lambda s: monkey_business(parse(s), 20),
        lambda s: monkey_business(parse(s), 10000, divisor=1),
    )
