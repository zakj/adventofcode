from dataclasses import dataclass

from aoc import main
from graph import Graph
from parse import paras


@dataclass
class Part:
    x: int
    m: int
    a: int
    s: int


@dataclass
class Step:
    target: str
    attr: str | None = None
    op: str | None = None
    value: int | None = None

    def test(self, part: Part) -> bool:
        if not self.attr:
            return True
        pval = getattr(part, self.attr)
        return pval < self.value if self.op == "<" else pval > self.value


def parse_workflow(line: str):
    name, steps_str = line.split("{")
    steps = []
    for step in steps_str[:-1].split(","):
        spl = step.split(":")
        if len(spl) == 2:
            steps.append(
                Step(
                    attr=spl[0][0],
                    op=spl[0][1],
                    value=int(spl[0][2:]),
                    target=spl[1],
                )
            )
        elif len(spl) == 1:
            steps.append(Step(target=spl[0]))
        else:
            raise ValueError
    return (name, steps)


def parse_part(line: str):
    attrs_str = line[1:-1].split(",")
    d = {}
    for attr in attrs_str:
        l, r = attr.split("=")
        d[l] = int(r)
    return Part(**d)


def part1(s: str) -> int:
    workflows_str, parts = paras(s)

    workflows = {}
    for line in workflows_str:
        name, steps = parse_workflow(line)
        workflows[name] = steps
    parts = [parse_part(line) for line in parts]
    accepted = []
    for part in parts:
        wfn = "in"
        done = False
        while not done:
            steps = workflows[wfn]
            for step in steps:
                if step.op == ">":
                    if getattr(part, step.attr) > step.value:
                        if step.target == "A":
                            accepted.append(part)
                            done = True
                        elif step.target == "R":
                            done = True
                        else:
                            wfn = step.target
                        break
                elif step.op == "<":
                    if getattr(part, step.attr) < step.value:
                        if step.target == "A":
                            accepted.append(part)
                            done = True
                        elif step.target == "R":
                            done = True
                        else:
                            wfn = step.target
                        break
                elif step.op is None:
                    if step.target == "A":
                        accepted.append(part)
                        done = True
                    elif step.target == "R":
                        done = True
                    else:
                        wfn = step.target
                    break
                else:
                    raise ValueError

    total = 0
    for part in accepted:
        total += part.x + part.m + part.a + part.s
    return total


@dataclass
class Op:
    attr: str
    lt: bool
    value: int

    def test(self, part: Part) -> bool:
        pval = getattr(part, self.attr)
        return pval < self.value if self.lt else pval > self.value


from typing import Iterable, TypeVar

Node = TypeVar("Node")


def all_paths(G: Graph[Node], start: Node, end: Node) -> Iterable[list[Node]]:
    distance = 0
    visited = {start}
    queue = [(start, [start])]
    while queue:
        distance += 1
        current = queue
        queue = []
        for node, path in current:
            for neighbor in G.neighbors(node):
                queue.append((neighbor, path + [neighbor]))
                if neighbor == end:
                    yield path + [neighbor]


@dataclass
class RangePart:
    x: tuple[int, int] = (1, 4000)
    m: tuple[int, int] = (1, 4000)
    a: tuple[int, int] = (1, 4000)
    s: tuple[int, int] = (1, 4000)


def go(workflows: dict[str, list[Step]], cur: str, rpart: RangePart) -> int:
    if cur == "A":
        score = 1
        for attr in "xmas":
            a, b = getattr(rpart, attr)
            score *= b - a + 1
        return score
    if cur == "R":
        return 0
    total = 0
    for step in workflows[cur]:
        if step.op is None:
            return total + go(workflows, step.target, rpart)
        assert step.attr is not None
        assert step.value is not None
        rng = getattr(rpart, step.attr)
        passthru = RangePart(rpart.x, rpart.m, rpart.a, rpart.s)
        rpart = RangePart(rpart.x, rpart.m, rpart.a, rpart.s)
        if step.op == "<":
            setattr(passthru, step.attr, (rng[0], step.value - 1))
            setattr(rpart, step.attr, (step.value, rng[1]))
        elif step.op == ">":
            setattr(passthru, step.attr, (step.value + 1, rng[1]))
            setattr(rpart, step.attr, (rng[0], step.value))
        else:
            raise ValueError
        total += go(workflows, step.target, passthru)

    raise ValueError


def part2(s: str) -> int:
    workflows_str, *_ = paras(s)
    workflows = {}
    for line in workflows_str:
        name, steps = parse_workflow(line)
        workflows[name] = steps

    return go(workflows, "in", RangePart())

    return -1


def part2_orig(s: str) -> int:
    if len(s) > 500:
        return -1
    workflows_str, *_ = paras(s)
    workflows_list = []
    workflows_dict = {}
    for line in workflows_str:
        name, steps = parse_workflow(line)
        workflows_list.append((name, steps))
        workflows_dict[name] = steps

    graph = Graph()
    graph.add_node("in")
    graph.add_node("A")
    graph.add_node("R")
    for name, steps in workflows_list:
        graph.add_node(name)

    for name, steps in workflows_list:
        for step in steps:
            graph.add_edge(name, step.target)

    paths = list(all_paths(graph, "in", "A"))
    from itertools import pairwise

    # class Ranges:
    #     def __init__(self, x=(1, 4000), m=(1, 4000), a=(1, 4000), s(1, 4000)):
    #         self.x = x
    #         self.m = m
    #         self.a = a
    #         self.s =s

    total = 0
    # for path in paths:
    #     print(f"{path=}")
    all_mins = []
    all_maxs = []
    total = 0
    for path in paths:
        print(f"{path=}")
        mins = {"x": 1, "m": 1, "a": 1, "s": 1}
        maxs = {"x": 4000, "m": 4000, "a": 4000, "s": 4000}
        # XXX THIS COULD HAVE MULTIPLE RANGES
        for a, b in pairwise(path):
            for step in workflows_dict[a]:
                if step.target != b:
                    if step.op == ">":
                        maxs[step.attr] = min(maxs[step.attr], step.value)
                    elif step.op == "<":
                        mins[step.attr] = max(mins[step.attr], step.value)
                else:
                    if step.op is None:
                        continue
                    elif step.op == ">":
                        mins[step.attr] = max(mins[step.attr], step.value + 1)
                    elif step.op == "<":
                        maxs[step.attr] = min(maxs[step.attr], step.value - 1)
                    break
        # print(f" {mins=}")
        # print(f" {maxs=}")
        # print("--")
        all_mins.append(mins)
        all_maxs.append(maxs)

    # good_ranges = []
    # track known good ranges, and the exclusion set, update for each one
    rest = all_mins[1:]
    good_ranges = {
        "x": [],
        "m": [],
        "a": [],
        "s": [],
    }

    total = 0
    for mins, maxs in zip(all_mins, all_maxs):
        subt = 1
        ranges = {}
        for attr in "xmas":
            ranges[attr] = set(range(mins[attr], maxs[attr] + 1))
            for gr in good_ranges[attr]:
                ranges[attr] -= gr
            good_ranges[attr].append(set(ranges[attr]))
            subt *= len(ranges[attr])
        total += subt
    print(f"{good_ranges=}")
    return total


if __name__ == "__main__":
    main(
        lambda s: part1(s),
        lambda s: part2(s),
    )
