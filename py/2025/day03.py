from aoc import main


def max_and_next_index(xs: str, start: int, end: int) -> tuple[str, int]:
    x = max(xs[start : end or None])
    xi = xs[start:].index(x) + start
    return x, xi + 1


def joltage(input: str, digits: int) -> int:
    banks = input.splitlines()
    total = 0
    for batteries in banks:
        rv = []
        start = 0
        for end in range(-digits + 1, 1):
            hi, start = max_and_next_index(batteries, start, end)
            rv.append(hi)
        total += int("".join(rv))
    return total


if __name__ == "__main__":
    main(
        lambda s: joltage(s, digits=2),
        lambda s: joltage(s, digits=12),
    )
