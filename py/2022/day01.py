from aoc import load, solve


def parse(input: str):
    # TODO: factor out paragraphs helper
    return [[int(n) for n in chunk.splitlines()] for chunk in input.split("\n\n")]


def total_calories(elves: list[list[int]]) -> list[int]:
    return [sum(elf) for elf in elves]


parts = solve(
    lambda s: max(total_calories(parse(s))),
    lambda s: sum(sorted(total_calories(parse(s)))[-3:]),
    expect=(71023, 206289),
)
