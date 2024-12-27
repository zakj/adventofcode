from collections import deque
from itertools import count

from aoc import main
from aoc.coords import Dir8 as Dir
from aoc.coords import Point, addp, find_bounds


def parse(s: str) -> set[Point]:
    elves = set()
    for y, line in enumerate(s.splitlines()):
        for x, c in enumerate(line):
            if c == "#":
                elves.add((x, y))
    return elves


def elf_life(s: str, rounds: int | None = None) -> int:
    elves = parse(s)
    rules = deque(
        [
            (Dir.N, set([Dir.N, Dir.NE, Dir.NW])),
            (Dir.S, set([Dir.S, Dir.SE, Dir.SW])),
            (Dir.W, set([Dir.W, Dir.NW, Dir.SW])),
            (Dir.E, set([Dir.E, Dir.NE, Dir.SE])),
        ]
    )

    dirs = list(Dir)  # optimization
    iterator = count(1) if rounds is None else range(rounds)
    for round in iterator:
        moves = 0
        current_elves = elves.copy()
        for elf in current_elves:
            neighbors = {d for d in dirs if addp(elf, d) in current_elves}
            if not neighbors:
                continue
            for dir, check in rules:
                if not neighbors & check:
                    next = addp(elf, dir)
                    if next in elves:
                        # Only two elves in opposing directions can conflict.
                        moves -= 1
                        elves.remove(next)
                        elves.add(addp(next, dir))
                    else:
                        moves += 1
                        elves.add(next)
                        elves.remove(elf)
                    break

        if moves == 0:
            return round
        rules.rotate(-1)

    (ax, ay), (bx, by) = find_bounds(elves)
    rect = (bx + 1 - ax) * (by + 1 - ay)
    return rect - len(elves)


# TODO optimize part 2; currently 1.91s
if __name__ == "__main__":
    main(
        lambda s: elf_life(s, 10),
        lambda s: elf_life(s),
    )
