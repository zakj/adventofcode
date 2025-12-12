import re
from dataclasses import dataclass
from functools import cache
from typing import Self

from aoc import main
from aoc.coords import Grid, Point
from aoc.parse import paras


@dataclass(frozen=True)
class Present:
    cells: frozenset[Point]

    @classmethod
    def from_string(cls, s: str) -> Self:
        grid = Grid(s)
        return cls(frozenset(grid.findall("#")))

    def __len__(self) -> int:
        return len(self.cells)

    @staticmethod
    def _normalize(cells: set[Point] | frozenset[Point]) -> frozenset[Point]:
        min_x = min(x for x, _ in cells)
        min_y = min(y for _, y in cells)
        return frozenset((x - min_x, y - min_y) for x, y in cells)

    def rotated(self, times=1) -> Self:
        cells = self.cells
        for _ in range(times % 4):
            cells = {(y, -x) for x, y in cells}
        return self.__class__(self._normalize(cells))

    def flipped(self) -> Self:
        return self.__class__(self._normalize({(-x, y) for x, y in self.cells}))

    @cache
    def orientations(self) -> set[Self]:
        uniq = set[Self]()
        for flip in self, self.flipped():
            for rot in range(4):
                uniq.add(flip.rotated(rot))
        return uniq


def parse(input: str) -> tuple[list[Present], list[tuple[tuple[int, int], tuple[int]]]]:
    *presents_str, regions_str = paras(input)
    presents = []
    for lines in presents_str:
        presents.append(Present.from_string("\n".join(lines[1:])))
    regions = []
    for line in regions_str:
        dim_str, *counts_str = re.split(r":? ", line)
        dim = tuple(int(d) for d in dim_str.split("x"))
        counts = tuple(int(c) for c in counts_str)
        regions.append((dim, counts))
    return presents, regions


# unused
def attempt_fit_presents(input: str) -> int:
    presents, regions = parse(input)
    total = 0

    @cache
    def fits(
        grid: tuple[str, ...],
        needed: tuple[int],
        present_index: int | None = None,
        x: int | None = None,
        y: int | None = None,
    ) -> bool:
        if not any(needed):
            print("\n".join(grid))
            print()
            return True
        if present_index is None:
            # try all the presents at all the indexes
            for i, c in enumerate(needed):
                if not c:
                    continue
                for y in range(len(grid)):
                    for x in range(len(grid[0])):
                        if fits(grid, needed, i, x, y):
                            return True
        else:
            assert x is not None and y is not None
            present = presents[present_index]

            fit_grids: list[tuple[str, ...]] = []
            for obj in present.orientations():
                next_grid = [list(line) for line in grid]
                for px, py in obj.cells:
                    nx = x + px
                    ny = y + py
                    if nx >= len(grid[0]) or ny >= len(grid):
                        break
                    if next_grid[y + py][x + px] != ".":
                        break
                    next_grid[y + py][x + px] = str(present_index)
                else:
                    fit_grids.append(tuple(["".join(line) for line in next_grid]))

            tmp = list(needed)
            tmp[present_index] -= 1
            return any(fits(g, tuple(tmp)) for g in fit_grids)
        return False

    for (width, height), requested in regions[:2]:
        grid = ["." * width for _ in range(height)]
        total += fits(tuple(grid), requested)

    return total


# This fails on the example input.
def part1(input: str):
    presents, regions = parse(input)
    total = 0
    for (w, h), requested in regions:
        if (w // 3) * (h // 3) >= sum(requested):
            total += 1
        elif (w * h) < sum(len(presents[i]) * c for i, c in enumerate(requested)):
            continue
        else:
            raise ValueError
    return total


if __name__ == "__main__":
    main(
        # attempt_fit_presents,
        part1,
        isolate=1,
    )
