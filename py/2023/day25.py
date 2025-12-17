import random
import re
from collections import Counter, defaultdict
from itertools import pairwise

from aoc import main
from aoc.graph_dyn import shortest_path, shortest_path_length


def cut_wires(s: str) -> int:
    G = defaultdict[str, set[str]](set)
    for line in s.splitlines():
        src, *dsts = re.split(r":? ", line)
        for dst in dsts:
            G[src].add(dst)
            G[dst].add(src)

    counts = Counter()
    # TODO: got to be a cleaner way than this
    for _ in range(150):
        a, b = random.sample(list(G), 2)
        path = shortest_path(G, a, b)
        for l, r in pairwise(path):
            key = tuple(sorted([l, r]))
            counts.update([key])

    for (a, b), _ in counts.most_common(3):
        G[a].remove(b)
        G[b].remove(a)

    [((a, b), _)] = counts.most_common(1)

    return len(shortest_path_length(G, a)) * len(shortest_path_length(G, b))


if __name__ == "__main__":
    main(cut_wires)
