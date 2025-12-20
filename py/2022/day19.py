from dataclasses import dataclass
from math import prod

from aoc import main
from aoc.parse import all_numbers, line_parser


# Used for inventory of resources and robots.
@dataclass(eq=True, frozen=True, order=True)
class Resource:
    geode: int
    obsidian: int
    clay: int
    ore: int

    def __add__(self, other: "Resource") -> "Resource":
        return Resource(
            self.geode + other.geode,
            self.obsidian + other.obsidian,
            self.clay + other.clay,
            self.ore + other.ore,
        )

    def __sub__(self, other: "Resource") -> "Resource":
        return Resource(
            self.geode - other.geode,
            self.obsidian - other.obsidian,
            self.clay - other.clay,
            self.ore - other.ore,
        )

    def all_lte(self, other: "Resource") -> bool:
        return (
            self.geode <= other.geode
            and self.obsidian <= other.obsidian
            and self.clay <= other.clay
            and self.ore <= other.ore
        )

    def multiply(self, n: int) -> "Resource":
        return Resource(self.geode * n, self.obsidian * n, self.clay * n, self.ore * n)


Option = tuple[Resource, Resource]  # cost, new robots
Blueprint = tuple[int, list[Option]]
QueueItem = tuple[Resource, Resource]  # inventory: resources, robots


@line_parser
def parse(
    line: str,
) -> Blueprint:
    i, a, b, c, d, e, f = all_numbers(line)
    options = [
        (Resource(0, 0, 0, a), Resource(0, 0, 0, 1)),
        (Resource(0, 0, 0, b), Resource(0, 0, 1, 0)),
        (Resource(0, 0, d, c), Resource(0, 1, 0, 0)),
        (Resource(0, f, 0, e), Resource(1, 0, 0, 0)),
        (Resource(0, 0, 0, 0), Resource(0, 0, 0, 0)),  # do nothing
    ]
    return (i, options)


def max_geodes(options: list[Option], time: int, max_q: int):
    def score(i: int, qi: QueueItem) -> Resource:
        return qi[0] + qi[1].multiply(time - i)

    q: list[QueueItem] = [(Resource(0, 0, 0, 0), Resource(0, 0, 0, 1))]
    for i in range(time):
        uniq_q = {score(i, x): x for x in q}.items()
        # hack: drop all but the highest-scored items
        q = [item for _, item in sorted(uniq_q, reverse=True)][:max_q]
        next = []
        for resources, robots in q:
            next_resources = resources + robots
            for cost, new_robots in options:
                if cost.all_lte(resources):
                    next.append((next_resources - cost, robots + new_robots))
        q = next
    return max(resources.geode for (resources, _) in q)


if __name__ == "__main__":
    main(
        lambda s: sum(max_geodes(opts, 24, 50) * i for i, opts in parse(s)),
        lambda s: prod(max_geodes(opts, 32, 500) for _, opts in parse(s)[:3]),
    )
