from dataclasses import dataclass

from aoc import main
from parse import all_numbers

Point3 = tuple[int, int, int]
# Brick = tuple[Point3, Point3]

# brick coords differ in only one dimension
# x, y, z
# z=0 is ground, so lowest brick can have z=1


# @dataclass(eq=True, frozen=True)
@dataclass
class Point3DC:
    x: int
    y: int
    z: int

    def __repr__(self) -> str:
        return f"{self.x},{self.y},{self.z}"


from functools import total_ordering
from typing import Iterable


# @total_ordering
class Brick:
    def __init__(self, i: int, a: Point3, b: Point3) -> None:
        self.name = chr(ord("A") + i)
        self.a = Point3DC(*a)
        self.b = Point3DC(*b)

    # def __lt__(self, other: "Brick") -> int:
    #     return 1 if min(self.a.z, self.b.z) < min(other.a.z, other.b.z) else -1

    # def __eq__(self, other: "Brick") -> bool:
    #     return self.a == other.a and self.b == other.b

    def __repr__(self) -> str:
        return f"{self.name}: |{self.a}~{self.b}|"

    def __hash__(self):
        return hash(((self.a.x, self.a.y, self.a.z), (self.b.x, self.b.y, self.b.z)))

    @property
    def x(self) -> Iterable[int]:
        return range(min(self.a.x, self.b.x), max(self.a.x, self.b.x) + 1)

    @property
    def y(self) -> Iterable[int]:
        return range(min(self.a.y, self.b.y), max(self.a.y, self.b.y) + 1)

    @property
    def z(self) -> Iterable[int]:
        return range(min(self.a.z, self.b.z), max(self.a.z, self.b.z) + 1)

    def resting_on(self, other: "Brick") -> bool:
        return bool(
            min(self.z) - 1 in other.z
            and (set(self.x) & set(other.x))
            and (set(self.y) & set(other.y))
        )

    def fall(self) -> None:
        self.a.z -= 1
        self.b.z -= 1


def parse(s: str) -> list[Brick]:
    bricks = []
    for i, line in enumerate(s.splitlines()):
        a, b = line.split("~")
        bricks.append(Brick(i, all_numbers(a), all_numbers(b)))
    return bricks


def settle(bricks: list[Brick]) -> list[Brick]:
    settled = set()
    bricks.sort(key=lambda brick: min(brick.a.z, brick.b.z))
    while len(settled) < len(bricks):
        for brick in bricks:
            if brick in settled:
                continue
            if 1 in brick.z:
                settled.add(brick)
                break
            for other in settled:
                if brick.resting_on(other):
                    settled.add(brick)
                    break
            else:
                brick.fall()

    return list(settled)


def part1(s: str) -> int:
    if len(s) > 500:
        return -1

    bricks = parse(s)
    bricks = settle(bricks)

    bricks.sort(key=lambda brick: min(brick.a.z, brick.b.z), reverse=True)
    # make a map of brick -> supported by
    resting_on = {}
    for brick in bricks:
        resting_on[brick] = []
        for other in bricks:
            if brick.resting_on(other):
                resting_on[brick].append(other)

    # print(f"{resting_on.items()=}")
    for b, rest in resting_on.items():
        print(b, rest)

    unsafe_bricks = set()
    for brick, supports in resting_on.items():
        if len(supports) == 1:
            unsafe_bricks.add(supports[0])
    # print(f"{unsafe_bricks=}")

    return len(bricks) - len(unsafe_bricks)


from collections import defaultdict


def part2(s: str) -> int:
    # if len(s) > 500:
    #     return -1

    bricks = parse(s)
    bricks = settle(bricks)
    print("done settling")

    bricks.sort(key=lambda brick: min(brick.a.z, brick.b.z), reverse=True)
    # make a map of brick -> supported by
    underneath = defaultdict(list)
    above = defaultdict(list)
    for brick in bricks:
        for other in bricks:
            if brick.resting_on(other):
                underneath[brick].append(other)
                above[other].append(brick)

    from collections import deque

    result = 0
    for brick in bricks:
        seen = set()
        queue = deque([brick])
        while queue:
            cur = queue.popleft()
            if cur in seen:
                continue
            seen.add(cur)
            for next in above[cur]:
                if next in seen:
                    continue
                if set(underneath[next]) and not set(underneath[next]) - seen:
                    queue.append(next)
        result += len(seen - {brick})
    return result
    # need to build a tree of dependencies, then sum the children of each node
    # class Tree:
    #     parents: list[Brick]
    #     children: int

    #     def __init__(self, parents, children) -> None:
    #         self.parents = parents
    #         self.children = children

    #     def __repr__(self) -> str:
    #         return f"{len(self.parents)} parents, {self.children} children"

    # from functools import cache

    # @cache
    # def count_above(brick: Brick) -> int:
    #     return len(above[brick]) + sum(count_above(cb) for cb in above[brick])

    # tree: dict[Brick, Tree] = {}
    # for brick in bricks:
    #     tree[brick] = Tree(underneath[brick], count_above(brick))

    # total = 0
    # for n in tree.items():
    #     if len(n.parents) == 1

    # for every node, find the children for whom it is the ONLY parent
    # for every node, if it has only one parent, add that parent to a candidate list

    # # print(f"{resting_on.items()=}")
    # for b, rest in resting_on.items():
    #     print(b, rest)

    # unsafe_bricks = set()
    # for brick, supports in resting_on.items():
    #     if len(supports) == 1:
    #         unsafe_bricks.add(supports[0])
    # # print(f"{unsafe_bricks=}")

    # return len(bricks) - len(unsafe_bricks)


if __name__ == "__main__":
    main(
        lambda s: part1(s),
        lambda s: part2(s),
    )
