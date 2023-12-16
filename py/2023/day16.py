from aoc import main
from coords import Dir, Point, addp


def part1(s: str) -> int:
    cur, dir = (0, 0), Dir.E
    lines = s.splitlines()
    seen: set[tuple[Point, Dir]] = set()
    energized = {cur} | walk(lines, cur, dir, seen)
    return len(energized)


def part2(s: str) -> int:
    lines = s.splitlines()
    best = 0
    for x in range(len(lines[0])):
        cur, dir = (x, 0), Dir.S
        seen: set[tuple[Point, Dir]] = set()
        best = max(best, len({cur} | walk(lines, cur, dir, seen)))
        cur, dir = (x, len(lines) - 1), Dir.N
        seen: set[tuple[Point, Dir]] = set()
        best = max(best, len({cur} | walk(lines, cur, dir, seen)))
    for y in range(len(lines)):
        cur, dir = (0, y), Dir.E
        seen: set[tuple[Point, Dir]] = set()
        best = max(best, len({cur} | walk(lines, cur, dir, seen)))
        cur, dir = (len(lines[0]) - 1, y), Dir.W
        seen: set[tuple[Point, Dir]] = set()
        best = max(best, len({cur} | walk(lines, cur, dir, seen)))
    return best


def walk(
    lines: list[str], cur: Point, dir: Dir, seen: set[tuple[Point, Dir]]
) -> set[Point]:
    height = len(lines)
    width = len(lines[0])
    energized = set()
    while True:
        x, y = cur
        if (cur, dir) in seen:
            return energized
        seen.add((cur, dir))
        if not (0 <= y < height and 0 <= x < width):
            break
        energized.add(cur)
        c = lines[y][x]
        if c == "/":
            if dir == Dir.E:
                cur, dir = addp(cur, Dir.N.value), Dir.N
            elif dir == Dir.W:
                cur, dir = addp(cur, Dir.S.value), Dir.S
            elif dir == Dir.S:
                cur, dir = addp(cur, Dir.W.value), Dir.W
            elif dir == Dir.N:
                cur, dir = addp(cur, Dir.E.value), Dir.E
        if c == "\\":
            if dir == Dir.E:
                cur, dir = addp(cur, Dir.S.value), Dir.S
            elif dir == Dir.W:
                cur, dir = addp(cur, Dir.N.value), Dir.N
            elif dir == Dir.S:
                cur, dir = addp(cur, Dir.E.value), Dir.E
            elif dir == Dir.N:
                cur, dir = addp(cur, Dir.W.value), Dir.W
        if c == "-":
            if dir in [Dir.W, Dir.E]:
                cur = addp(cur, dir.value)
            else:
                energized |= walk(lines, addp(cur, Dir.W.value), dir.W, seen)
                energized |= walk(lines, addp(cur, Dir.E.value), dir.E, seen)
                break
        if c == "|":
            if dir in [Dir.N, Dir.S]:
                cur = addp(cur, dir.value)
            else:
                energized |= walk(lines, addp(cur, Dir.N.value), dir.N, seen)
                energized |= walk(lines, addp(cur, Dir.S.value), dir.S, seen)
                break
        if c == ".":
            cur = addp(cur, dir.value)

    return energized


if __name__ == "__main__":
    main(
        lambda s: part1(s),
        lambda s: part2(s),
    )
