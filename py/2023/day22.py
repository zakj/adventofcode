from collections import defaultdict, deque

from aoc import main
from coords import Point
from parse import all_numbers

Point3 = tuple[int, int, int]
Tree = dict["Brick", set["Brick"]]


class Brick:
    def __init__(self, a: Point3, b: Point3) -> None:
        assert all(a <= b for a, b in zip(a, b))
        self.a = Point3(a)
        self.b = Point3(b)

    def __repr__(self) -> str:
        return f"|{self.a}~{self.b}|"

    @property
    def xy(self) -> set[Point]:
        rv = set()
        for x in range(self.a[0], self.b[0] + 1):
            for y in range(self.a[1], self.b[1] + 1):
                rv.add((x, y))
        return rv

    def fall(self, n: int) -> None:
        self.a = (self.a[0], self.a[1], self.a[2] - n)
        self.b = (self.b[0], self.b[1], self.b[2] - n)


def parse(s: str) -> list[Brick]:
    bricks = []
    for line in s.splitlines():
        a, b = line.split("~")
        a, b = tuple(all_numbers(a)), tuple(all_numbers(b))
        assert len(a) == 3 and len(b) == 3
        bricks.append(Brick(a, b))
    return bricks


def settle(bricks: list[Brick]) -> tuple[Tree, Tree]:
    highest_brick: dict[tuple[int, int], Brick] = {}
    parents: Tree = {}
    children: Tree = defaultdict(set)

    for brick in sorted(bricks, key=lambda brick: brick.a[2]):
        candidates = [highest_brick.get((c[0], c[1])) for c in brick.xy]
        candidates = {b for b in candidates if b}
        z = max((other.b[2] for other in candidates), default=1)
        parents[brick] = {brick for brick in candidates if brick.b[2] == z}
        for other in candidates:
            children[other].add(brick)
        brick.fall(brick.a[2] - z - 1)
        for cube in brick.xy:
            highest_brick[cube[0], cube[1]] = brick

    return parents, children


def safe_to_remove(s: str) -> int:
    parents, _ = settle(parse(s))
    unsafe_bricks = set()
    for bricks in parents.values():
        if len(bricks) == 1:
            unsafe_bricks.add(list(bricks)[0])
    return len(parents) - len(unsafe_bricks)


def total_fallen(s: str) -> int:
    parents, children = settle(parse(s))
    fallen = 0
    for brick in parents:
        seen = set()
        queue = deque([brick])
        while queue:
            cur = queue.popleft()
            if cur in seen:
                continue
            seen.add(cur)
            for next in children[cur]:
                if next in seen:
                    continue
                if not set(parents[next]) - seen:
                    queue.append(next)
        fallen += len(seen - {brick})
    return fallen


if __name__ == "__main__":
    main(safe_to_remove, total_fallen)
