from aoc import main
from parse import paras


def find_mirror(lines: list[str], skip=None) -> int | None:
    for col in range(len(lines[0]) - 1):
        match = True
        for line in lines:
            left = line[: col + 1]
            right = line[col + 1 :]
            size = min([len(left), len(right)])
            if len(left) > size:
                left = left[len(left) - size :]
            if len(right) > size:
                right = right[:size]
            right = right[::-1]
            if left != right:
                match = False
                break
        if match and col + 1 != skip:
            return col + 1
    return None


def part1(s: str) -> int:
    col_matches = []
    row_matches = []
    for map in paras(s):
        match = find_mirror(map)
        if match is not None:
            col_matches.append(match)
            continue

        rotated = ["".join(x).strip() for x in zip(*reversed(map))]
        match = find_mirror(rotated)
        assert match is not None
        row_matches.append(len(rotated[0]) - match)
    return sum(col_matches) + sum(r * 100 for r in row_matches)


def part2(s: str) -> int:
    col_matches = []
    row_matches = []
    for map in paras(s):
        prev = None
        prev_is_col = None
        match = find_mirror(map)
        if match is not None:
            prev = match
            prev_is_col = True
        else:
            rotated = ["".join(x).strip() for x in zip(*reversed(map))]
            match = find_mirror(rotated)
            assert match is not None
            prev = match
            prev_is_col = False
        found = False
        for y in range(len(map)):
            if found:
                continue
            for x, c in enumerate(map[y]):
                from copy import copy

                change = list(map[y])
                change[x] = "." if c == "#" else "#"
                map2 = copy(map)
                map2[y] = "".join(change)

                match = find_mirror(map2, skip=prev if prev_is_col else None)
                if match is not None:
                    col_matches.append(match)
                    found = True
                    break
                rotated = ["".join(x).strip() for x in zip(*reversed(map2))]
                match = find_mirror(rotated, skip=None if prev_is_col else prev)
                if match is not None:
                    row_matches.append(len(rotated[0]) - match)
                    found = True
                    break
        if not found:
            raise ValueError

    return sum(col_matches) + sum(r * 100 for r in row_matches)


if __name__ == "__main__":
    main(
        lambda s: part1(s),
        lambda s: part2(s),
    )
