import re
from collections import defaultdict
from math import prod

from aoc import main


def hash(s: str) -> int:
    value = 0
    for c in s:
        value += ord(c)
        value *= 17
        value %= 256
    return value


def initialize(s: str) -> int:
    sequence = s.replace("\n", "").split(",")
    return sum(hash(s) for s in sequence)


def focus_lenses(s: str) -> int:
    sequence = s.replace("\n", "").split(",")
    pattern = re.compile(r"(\w+)([=-])(\d?)")
    boxes: dict[int, list[tuple[str, str]]] = defaultdict(list)
    for step in sequence:
        match = pattern.fullmatch(step)
        assert match is not None
        label, op, length = match.groups()
        box = boxes[hash(label)]
        if op == "-":
            i = next((i for i, (l, _) in enumerate(box) if l == label), None)
            if i is not None:
                del box[i]
        elif op == "=":
            lens = (label, length)
            i = next((i for i, (l, _) in enumerate(box) if l == label), None)
            if i is not None:
                box[i] = lens
            else:
                box.append(lens)

    return sum(
        prod([bi + 1, li + 1, int(length)])
        for bi, box in boxes.items()
        for li, (_, length) in enumerate(box)
    )


if __name__ == "__main__":
    main(
        lambda s: initialize(s),
        lambda s: focus_lenses(s),
    )
