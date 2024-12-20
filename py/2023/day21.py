from collections import defaultdict
from itertools import count

from aoc import main
from coords import Grid, Point, neighbors
from graph_dyn import DiGraph


class Farm(DiGraph):
    def __init__(self, s: str):
        self.grid = Grid(s)
        self.start = self.grid.find("S")
        self.walkable = set(self.grid.findall(".")) | {self.start}

    def __getitem__(self, node: Point) -> set[Point]:
        return {n for n in neighbors(node) if n in self.walkable}


def reachable(s: str, steps: int) -> int:
    G = Farm(s)

    seen = defaultdict(set)
    queue = [G.start]
    for step in range(1, steps + 1):
        current = set(queue)
        queue = []
        for node in current:
            for neighbor in G[node]:
                seen[step].add(neighbor)
                queue.append(neighbor)
    return len(seen[steps])


def infinite_reachable(s: str, steps: int) -> int:
    G = Farm(s)
    start = G.start

    evens = set()
    odds = set()
    queue = [start]
    for step in count(1):
        if len(queue) == 0:
            break
        current = set(queue)
        queue = []
        seen = evens if step % 2 == 0 else odds
        for node in current:
            for neighbor in G[node]:
                if neighbor in seen:
                    continue
                seen.add(neighbor)
                queue.append(neighbor)

    lines = s.splitlines()
    width = len(lines[0])
    height = len(lines)
    reachable_full_grids = steps // height

    total = len(odds)  # start grid is odd
    for i in range(1, reachable_full_grids):
        total += i * 4 * len(odds if i % 2 == 0 else evens)

    def walk(start: Point, steps: int) -> int:
        evens = set()
        odds = set()
        queue = [start]
        for step in range(1, steps + 1):
            current = set(queue)
            queue = []
            seen = evens if step % 2 == 0 else odds
            for node in current:
                for neighbor in G[node]:
                    if neighbor in seen:
                        continue
                    seen.add(neighbor)
                    queue.append(neighbor)
        if steps % 2 == 0:
            return len(evens)
        return len(odds)

    # top, right, bottom, left: one of each type, at each corner
    assert height == width
    steps_remaining = (steps - start[0] - 1) % width
    for cstart in [
        (start[0], height - 1),
        (0, start[1]),
        (start[0], 0),
        (width - 1, start[1]),
    ]:
        total += walk(cstart, steps_remaining)

    # diagonal edges, two sizes for each direction
    steps_remaining = (steps - start[0] - start[1] - 2) % (height + width)
    for dstart in [(0, height - 1), (0, 0), (width - 1, 0), (width - 1, height - 1)]:
        total += walk(dstart, steps_remaining) * (reachable_full_grids - 1)
    steps_remaining = (steps - start[0] - start[1] - height - 2) % (height + width)
    for dstart in [(0, height - 1), (0, 0), (width - 1, 0), (width - 1, height - 1)]:
        total += walk(dstart, steps_remaining) * reachable_full_grids

    return total


if __name__ == "__main__":
    main(
        lambda s, steps_p1: reachable(s, steps_p1),
        lambda s, steps_p2: infinite_reachable(s, steps_p2),
    )
