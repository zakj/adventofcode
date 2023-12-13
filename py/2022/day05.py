import re

from aoc import main
from parse import paras
from util import rotate_cw

Stacks = dict[int, list[str]]
Instruction = tuple[int, ...]


def parse(s: str) -> tuple[Stacks, list[Instruction]]:
    drawing, instructions_str = paras(s)
    rotated = rotate_cw(drawing)
    stacks = {int(x[0]): list(x[1:]) for x in rotated if re.match(r"[0-9]", x)}
    instructions = [
        tuple(int(x) for x in re.findall(r"\d+", line)) for line in instructions_str
    ]
    return stacks, instructions


def rearrange_9000(stacks: Stacks, instructions: list[Instruction]) -> str:
    for n, src, dst in instructions:
        for _ in range(n):
            stacks[dst].append(stacks[src].pop())
    return "".join(s[-1] for s in stacks.values())


def rearrange_9001(stacks: Stacks, instructions: list[Instruction]) -> str:
    for n, src, dst in instructions:
        stacks[dst].extend(stacks[src][-n:])
        del stacks[src][-n:]
    return "".join(s[-1] for s in stacks.values())


if __name__ == "__main__":
    main(
        lambda s: rearrange_9000(*parse(s)),
        lambda s: rearrange_9001(*parse(s)),
    )
