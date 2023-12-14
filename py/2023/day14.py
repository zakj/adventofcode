from aoc import main

Map = list[list[str]]


def weight(map: Map) -> int:
    return sum((len(map) - y) * line.count("O") for y, line in enumerate(map))


def tilt(map: Map) -> Map:
    for x in range(len(map[0])):
        top = -1
        for y, line in enumerate(map):
            c = line[x]
            if c == "#":
                top = y
            elif c == "O":
                top += 1
                if top < y:
                    map[top][x] = "O"
                    line[x] = "."
    return map


# TODO: try storing map as two sets of rolling/block points
def spin_cycle(s: str, goal=1_000_000_000) -> int:
    map = [list(line) for line in s.splitlines()]

    seen = {}
    for i in range(1, goal):
        for _ in range(4):
            map = tilt(map)
            map = [list(line) for line in zip(*reversed(map))]
        hash = "".join("".join(line) for line in map)
        if hash in seen and (goal - i) % (i - seen[hash]) == 0:
            break
        seen[hash] = i

    return weight(map)


if __name__ == "__main__":
    main(
        lambda s: weight(tilt([list(line) for line in s.splitlines()])),
        lambda s: spin_cycle(s),
        # profile=1,
    )
