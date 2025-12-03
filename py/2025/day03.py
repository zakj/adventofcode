from functools import partial

from aoc import main


def joltage(bank: str, digits: int) -> str:
    if not digits:
        return ""
    end = -(digits - 1) or None
    hi = max(bank[:end])
    return hi + joltage(bank[bank.index(hi) + 1 :], digits - 1)


def total_joltage(input: str, *, digits: int) -> int:
    return sum(int(joltage(bank, digits)) for bank in input.splitlines())


if __name__ == "__main__":
    main(
        partial(total_joltage, digits=2),
        partial(total_joltage, digits=12),
    )
