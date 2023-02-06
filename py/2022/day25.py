from aoc import main

SNAFU = "=-012"


def parse(input: str) -> list[int]:
    return [snafu_to_int(list(s)) for s in input.splitlines()]


def snafu_to_int(snafu: list[str]) -> int:
    return sum((SNAFU.find(d) - 2) * pow(5, i) for i, d in enumerate(reversed(snafu)))


def int_to_snafu(n: int) -> str:
    if n == 0:
        return ""
    a, b = divmod(n + 2, 5)
    return (int_to_snafu(a) + SNAFU[b]) or "0"


if __name__ == "__main__":
    main(
        lambda s: int_to_snafu(sum(parse(s))),
    )
