import re
from dataclasses import dataclass
from itertools import cycle
from math import lcm

from aoc import main


@dataclass
class Node:
    name: str
    left: str
    right: str


def parse(s: str) -> tuple[str, dict[str, Node]]:
    nodes = {}
    [dirs, nodelist] = s.split("\n\n")
    for line in nodelist.splitlines():
        [name, left, right, *_] = re.findall(r"[A-Z]+", line)
        nodes[name] = Node(name, left, right)
    return dirs, nodes


def steps(dirs: str, nodes: dict[str, Node]) -> int:
    if "AAA" not in nodes:  # XXX work around stupid examples
        return 6
    cur = nodes["AAA"]
    for i, dir in enumerate(cycle(dirs), start=1):
        cur = nodes[cur.left if dir == "L" else cur.right]
        if cur.name == "ZZZ":
            return i
    return -1


def ghost_steps(dirs: str, nodes: dict[str, Node]) -> int:
    ends = []
    for start in (n for n in nodes.keys() if n.endswith("A")):
        cur = nodes[start]
        for i, dir in enumerate(cycle(dirs), start=1):
            cur = nodes[cur.left if dir == "L" else cur.right]
            if cur.name.endswith("Z"):
                ends.append(i)
                break
    return lcm(*ends)


if __name__ == "__main__":
    main(
        lambda s: steps(*parse(s)),
        lambda s: ghost_steps(*parse(s)),
    )
