from collections import defaultdict
from typing import Any

from aoc import main
from coords import Point
from graph import Graph, shortest_path_length


def part1(s: str, steps: int) -> int:
    # if len(s) > 500:
    #     return -1

    def edgeweights(from_node, from_data, to_node, to_data) -> bool:
        return from_data["label"] == "." and to_data["label"] == "."

    def attrs(c: str) -> dict[str, Any]:
        is_start = c == "S"
        label = "." if is_start else c
        return {"label": label, "is_start": is_start}

    G = Graph.from_grid(s, edgeweights, attrs)
    start = next(node for node, data in G.nodes.items() if data["is_start"])

    visited = defaultdict(set)
    queue = [start]
    for step in range(1, steps + 1):
        current = set(queue)
        queue = []
        for node in current:
            for neighbor in G.neighbors(node):
                visited[step].add(neighbor)
                queue.append(neighbor)
    return len(visited[steps])


from typing import Iterable


class RepeatingGraph(Graph[Point]):
    width: int
    height: int

    def neighbors(self, node: Point) -> Iterable[Point]:
        if node in self.edges:
            return self.edges[node]
        x, y = node
        grids_x = (self.width // x) * x if x else 0
        grids_y = (self.height // y) * y if y else 0
        x %= self.width
        y %= self.height
        return ((nx + grids_x, ny + grids_y) for nx, ny in self.edges[x, y])


def part2_orig(s: str, steps: int) -> int:
    if len(s) > 500:
        return -1

    # map how many steps it takes to get from each spot to each other spot
    # extrapolate edges

    def edgeweights(from_node, from_data, to_node, to_data) -> bool:
        return from_data["label"] == "." and to_data["label"] == "."

    def attrs(c: str) -> dict[str, Any]:
        is_start = c == "S"
        label = "." if is_start else c
        return {"label": label, "is_start": is_start}

    G = RepeatingGraph.from_grid(s, edgeweights, attrs)
    start = next(node for node, data in G.nodes.items() if data["is_start"])
    lines = s.splitlines()
    max_x = len(lines[0]) - 1
    max_y = len(lines) - 1

    # for x in range(0, G.width):
    #     G.add_edge((x, 0), (x, G.height - 1))
    #     G.add_edge((x, 0), (x, G.height - 1))

    # print(f"{G.neighbors((0, 0))=}")
    # print(f"{list(G.neighbors((G.width, 0)))=}")

    # count how many farms I can get to and the minimum number of steps it takes to get to each

    garden = [n for n, d in G.nodes.items() if d["label"] == "."]
    perimeter = [(x, y) for x, y in garden if x in [0, max_x] or y in [0, max_y]]

    lengths = {}
    for start in garden:
        for end in garden:
            lengths[start, end] = shortest_path_length(G, start, end)

    print(f"{max(lengths.values())=}")
    for a in perimeter:
        x, y = a
        if x != 0:
            continue
        for b in perimeter:
            if b[0] != max_x:
                continue
            print(a, b, lengths[a, b])

    return -1


from itertools import count


def part2(s: str, steps: int) -> int:
    if len(s) < 500:
        # TODO skip example
        return -1

    def edgeweights(from_node, from_data, to_node, to_data) -> bool:
        return from_data["label"] == "." and to_data["label"] == "."

    def attrs(c: str) -> dict[str, Any]:
        is_start = c == "S"
        label = "." if is_start else c
        return {"label": label, "is_start": is_start}

    G = Graph.from_grid(s, edgeweights, attrs)
    start = next(node for node, data in G.nodes.items() if data["is_start"])

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
            for neighbor in G.neighbors(node):
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
                for neighbor in G.neighbors(node):
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
    total += walk((start[0], height - 1), steps_remaining)
    total += walk((0, start[1]), steps_remaining)
    total += walk((start[0], 0), steps_remaining)
    total += walk((width - 1, start[1]), steps_remaining)

    # diagonal edges, two sizes for each direction
    # THERE ARE FEWER OF THE CLOSE ONES
    steps_remaining = (steps - start[0] - start[1] - 2) % (height + width)
    close_diagonals = 0
    close_diagonals += walk((0, height - 1), steps_remaining)
    close_diagonals += walk((0, 0), steps_remaining)
    close_diagonals += walk((width - 1, 0), steps_remaining)
    close_diagonals += walk((width - 1, height - 1), steps_remaining)
    total += close_diagonals * (reachable_full_grids - 1)

    steps_remaining = (steps - start[0] - start[1] - height - 2) % (height + width)
    far_diagonals = 0
    far_diagonals += walk((0, height - 1), steps_remaining)
    far_diagonals += walk((0, 0), steps_remaining)
    far_diagonals += walk((width - 1, 0), steps_remaining)
    far_diagonals += walk((width - 1, height - 1), steps_remaining)
    total += far_diagonals * (reachable_full_grids)

    return total


if __name__ == "__main__":
    main(
        lambda s, steps_p1: part1(s, steps_p1),
        lambda s, steps_p2: part2(s, steps_p2),
    )
