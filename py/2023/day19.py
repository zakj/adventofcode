import re
from dataclasses import dataclass
from math import prod
from operator import gt, lt

from aoc import main
from parse import paras


@dataclass
class Step:
    attr: str
    op: str
    value: int
    target: str

    def __call__(self, **attrs: int) -> bool:
        op = {"<": lt, ">": gt}[self.op]
        return op(attrs[self.attr], self.value)


@dataclass
class Workflow:
    steps: list[Step]
    default: str


Part = dict[str, int]
IntervalPart = dict[str, tuple[int, int]]


def parse_workflow(line: str) -> tuple[str, Workflow]:
    match = re.match(r"(\w+){(.+)}", line)
    assert match is not None
    name = match.group(1)
    *steps_str, default = match.group(2).split(",")
    steps = []
    for step in steps_str:
        match = re.match(r"(\w+)([<>])(\d+):(\w+)", step)
        assert match is not None
        attr, op, value, target = match.groups()
        steps.append(Step(attr, op, int(value), target))
    return name, Workflow(steps, default)


def parse_part(line: str) -> Part:
    attrs_str = line[1:-1].split(",")
    return {k: int(v) for k, v in (attr.split("=") for attr in attrs_str)}


def is_accepted(workflows: dict[str, Workflow], part: Part) -> bool:
    name = "in"
    while True:
        if name in "AR":
            return name == "A"
        for step in workflows[name].steps:
            if step(**part):
                name = step.target
                break
        else:
            name = workflows[name].default


def accepted_ratings(s: str) -> int:
    workflows, parts = paras(s)
    workflows = dict(parse_workflow(line) for line in workflows)
    parts = [parse_part(line) for line in parts]
    return sum(attr for p in parts if is_accepted(workflows, p) for attr in p.values())


def dc(workflows: dict[str, Workflow], cur: str, part: IntervalPart) -> int:
    if cur == "A":
        return prod(b - a + 1 for a, b in (part[attr] for attr in "xmas"))
    if cur == "R":
        return 0
    total = 0
    for step in workflows[cur].steps:
        lower, upper = part[step.attr]
        branch = dict(part)
        if step.op == "<":
            branch[step.attr] = (lower, step.value - 1)
            part[step.attr] = (step.value, upper)
        elif step.op == ">":
            branch[step.attr] = (step.value + 1, upper)
            part[step.attr] = (lower, step.value)
        total += dc(workflows, step.target, branch)
    return total + dc(workflows, workflows[cur].default, part)


def distinct_combinations(s: str) -> int:
    workflows = dict(parse_workflow(line) for line in paras(s)[0])
    return dc(workflows, "in", {attr: (1, 4000) for attr in "xmas"})


if __name__ == "__main__":
    main(accepted_ratings, distinct_combinations)
