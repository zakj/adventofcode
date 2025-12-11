import re
from collections.abc import Iterable
from functools import cache
from typing import Self

from aoc import main
from aoc.graph_dyn import Edges


def parse(input: str) -> Edges:
    edges = {}
    for line in input.splitlines():
        src, *dsts = re.split(r":? ", line)
        edges[src] = set(dsts)
    return edges


def part1(input: str):
    return len(all_paths(parse(input), "you", "out"))


def all_paths(
    edges: Edges, src: str, dst: str, stop: set[str] | None = None
) -> set[tuple[str, ...]]:
    if stop is None:
        stop = set()
    queue: list[tuple[tuple[str, ...], set[str]]] = [((src,), {src})]
    successful_paths: set[tuple[str, ...]] = set()
    visited_paths = set()
    while queue:
        path, visited = queue.pop()
        cur = path[-1]
        if cur == dst:
            successful_paths.add(path)
            continue
        if cur in stop:
            continue
        if path in visited_paths:
            continue
        visited_paths.add(path)
        for n in edges.get(cur, []):
            if n in visited:
                continue
            queue.append((path + (n,), visited | {n}))
    return successful_paths


class Bitmask(int):
    @classmethod
    def from_list(cls, indexes: Iterable[int]) -> Self:
        return cls(sum(1 << i for i in indexes))

    def on(self, i: int, /) -> Self:
        return self.__class__(self | (1 << i))

    def off(self, i: int, /) -> Self:
        return self.__class__(self & ~(1 << i))

    def toggle(self, i: int, /) -> Self:
        return self.__class__(self ^ (1 << i))

    def __contains__(self, i: int, /) -> bool:
        return bool(self & (1 << i))

    def __and__(self, value: int | Self, /) -> Self:
        return self.__class__(super().__and__(value))

    def __invert__(self) -> Self:
        return self.__class__(super().__invert__())

    def __or__(self, value: int | Self, /) -> Self:
        return self.__class__(super().__or__(value))

    def __xor__(self, value: int | Self, /) -> Self:
        return self.__class__(super().__xor__(value))

    __rand__ = __and__
    __ror__ = __or__
    __rxor__ = __xor__


def part2(input: str):
    # mm = all_shortest_path_lengths(parse(input))

    # return 0

    edges = parse(input)
    dac = 0
    fft = 1
    goal = Bitmask.from_list([dac, fft])

    @cache
    def count_paths(cur: str, seen: Bitmask) -> int:
        if cur == "out":
            if seen == goal:
                return 1
            return 0
        if cur == "dac":
            seen = seen.on(dac)
        elif cur == "fft":
            seen = seen.on(fft)
        return sum(count_paths(n, seen) for n in edges[cur])

    return count_paths("svr", Bitmask())

    # print(1)
    # svr_dac = all_paths(edges, "svr", "dac", {"fft", "out"})
    # print(2)
    # svr_fft = all_paths(edges, "svr", "fft", {"dac", "out"})
    # print(3)
    # dac_fft = all_paths(edges, "dac", "fft", {"svr", "out"})
    # print(4)
    # fft_dac = all_paths(edges, "dac", "fft", {"svr", "out"})
    # print(5)
    # dac_out = all_paths(edges, "dac", "out", {"svr", "fft"})
    # print(6)
    # fft_out = all_paths(edges, "fft", "out", {"svr", "dac"})
    # return 0

    # queue = deque([(("svr",), {"svr"})])
    # successful_paths = set()
    # visited_paths = set()
    # i = 0

    # while queue:
    #     i += 1
    #     if i % 1000 == 0:
    #         status(str(len(queue)))
    #     path, visited = queue.pop()
    #     if path in visited_paths:
    #         print("got em")
    #         continue
    #     visited_paths.add(path)
    #     cur = path[-1]
    #     if cur == "out":
    #         if "dac" in visited and "fft" in visited:
    #             successful_paths.add(path)
    #         continue
    #     for n in edges[cur]:
    #         if n in visited:
    #             continue
    #         queue.append((path + (n,), visited | {n}))
    # return len(successful_paths)


if __name__ == "__main__":
    main(
        part1,
        part2,
        # isolate=1,
    )
