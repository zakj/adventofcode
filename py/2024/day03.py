import re

from aoc import main


def parse(s: str):
    pass


def part1(s: str) -> int:
    mul_re = re.compile(r"mul\((\d{1,3}),(\d{1,3})\)")
    matches = mul_re.findall(s)
    total = 0
    for match in matches:
        total += int(match[0]) * int(match[1])
    return total


def part2(s: str) -> int:
    mul_re = re.compile(r"mul\((\d{1,3}),(\d{1,3})\)")
    do_re = re.compile(r"do\(\)")
    dont_re = re.compile(r"don't\(\)")
    muls = mul_re.finditer(s)
    dos = do_re.finditer(s)
    donts = dont_re.finditer(s)

    indexes: dict[int, re.Match[str]] = {}
    for m in muls:
        indexes[m.start()] = m
    for m in dos:
        indexes[m.start()] = m
    for m in donts:
        indexes[m.start()] = m

    enabled = True
    total = 0
    for k in sorted(indexes.keys()):
        m = indexes[k]
        if m.group().startswith("do("):
            print("found a do")
            enabled = True
        elif m.group().startswith("don"):
            print("found a dont")
            enabled = False
        elif m.group().startswith("mul") and enabled:
            total += int(m.group(1)) * int(m.group(2))

    return total


if __name__ == "__main__":
    main(
        part1,
        part2,
    )
