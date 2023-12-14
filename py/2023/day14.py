from aoc import main
from util import rotate_cw


def part1(s: str) -> int:
    map = [list(line) for line in s.splitlines()]
    for y, line in enumerate(map):
        for x, c in enumerate(line):
            ny = y - 1
            if c != "O":
                continue
            while ny >= 0 and map[ny][x] == ".":
                map[ny][x] = "O"
                map[ny + 1][x] = "."
                ny -= 1
    total = 0
    for y, line in enumerate(map):
        total += (len(map) - y) * sum(1 for c in line if c == "O")
    return total


def spin(map: list[list[str]]) -> list[list[str]]:
    for y, line in enumerate(map):
        for x, c in enumerate(line):
            ny = y - 1
            if c != "O":
                continue
            while ny >= 0 and map[ny][x] == ".":
                map[ny][x] = "O"
                map[ny + 1][x] = "."
                ny -= 1
    return map


def spin_cycle(s: str) -> int:
    # if len(s) > 500:
    #     return 0
    map = [list(line) for line in s.splitlines()]

    def hash(map: list[list[str]]) -> str:
        return "\n".join("".join(line) for line in map)

    seen = {}
    goal = 1_000_000_000
    for i in range(1, goal):
        map = spin(map)
        map = [list(line) for line in rotate_cw(["".join(line) for line in map])]
        map = spin(map)
        map = [list(line) for line in rotate_cw(["".join(line) for line in map])]
        map = spin(map)
        map = [list(line) for line in rotate_cw(["".join(line) for line in map])]
        map = spin(map)
        map = [list(line) for line in rotate_cw(["".join(line) for line in map])]
        hh = hash(map)
        if hh in seen and (goal - i) % (i - seen[hh]) == 0:
            break
        seen[hh] = i

    total = 0
    for y, line in enumerate(map):
        total += (len(map) - y) * sum(1 for c in line if c == "O")
    return total


if __name__ == "__main__":
    main(
        lambda s: part1(s),
        lambda s: spin_cycle(s),
    )
