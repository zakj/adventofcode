from aoc import main

Pair = tuple[set[int], set[int]]


def parse(s: str) -> list[Pair]:
    rv: list[Pair] = []
    for line in s.splitlines():
        a, b = line.split(",", 2)
        a_start, a_end = [int(x) for x in a.split("-", 2)]
        b_start, b_end = [int(x) for x in b.split("-", 2)]
        rv.append((set(range(a_start, a_end + 1)), set(range(b_start, b_end + 1))))
    return rv


if __name__ == "__main__":
    main(
        lambda s: len([1 for a, b in parse(s) if a <= b or b <= a]),
        lambda s: len([1 for a, b in parse(s) if a & b]),
    )
