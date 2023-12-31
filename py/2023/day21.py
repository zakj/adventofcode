# TODO: cleanup
from collections import defaultdict
from itertools import count

from aoc import main
from coords import Point
from graph import DiGraph


def parse(s: str) -> tuple[DiGraph[Point], Point]:
    def edgeweights(from_node, from_data, to_node, to_data) -> bool:
        return from_data["label"] == "." and to_data["label"] == "."

    def attrs(c: str) -> dict:
        is_start = c == "S"
        label = "." if is_start else c
        return {"label": label, "is_start": is_start}

    G = DiGraph.from_grid(s, edgeweights, attrs)
    start = next(n for n, is_start in G.attr("is_start") if is_start)
    return G, start


def part1(s: str, steps: int) -> int:
    G, start = parse(s)

    seen = defaultdict(set)
    queue = [start]
    for step in range(1, steps + 1):
        current = set(queue)
        queue = []
        for node in current:
            for neighbor in G[node]:
                seen[step].add(neighbor)
                queue.append(neighbor)
    return len(seen[steps])


def part2(s: str, steps: int) -> int:
    if len(s) < 500:
        # TODO skip example
        return -1

    G, start = parse(s)

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

    # TODO zone-based approach
    # https://www.reddit.com/r/adventofcode/comments/18nevo3/comment/keanfsh/

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
        lambda s, steps_p1: part1(s, steps_p1),
        lambda s, steps_p2: part2(s, steps_p2),
    )
