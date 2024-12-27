import random
import re
from collections import Counter
from itertools import pairwise

from aoc import main
from aoc.graph import DiGraph, shortest_path


def reachable_nodes_count(G: DiGraph, node) -> int:
    queue = [node]
    seen = set()
    while queue:
        current = set(queue)
        queue = []
        for node in current:
            if node in seen:
                continue
            seen.add(node)
            queue.extend(G[node])
    return len(seen)


def cut_wires(s: str) -> int:
    G = DiGraph()
    for line in s.splitlines():
        src, *dsts = re.split(r":? ", line)
        for dst in dsts:
            G.add_edge(src, dst)
            G.add_edge(dst, src)

    counts = Counter()
    # TODO: got to be a cleaner way than this
    for _ in range(100):
        a, b = random.sample(list(G), 2)
        path = shortest_path(G, a, b)
        for l, r in pairwise(path):
            key = tuple(sorted([l, r]))
            counts.update([key])

    for (a, b), _ in counts.most_common(3):
        G.remove_edge(a, b)
        G.remove_edge(b, a)

    [((a, b), _)] = counts.most_common(1)
    return reachable_nodes_count(G, a) * reachable_nodes_count(G, b)


if __name__ == "__main__":
    main(cut_wires)
