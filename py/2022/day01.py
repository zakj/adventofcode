from aoc import main


def parse(input: str):
    # TODO: factor out paragraphs helper
    return [[int(n) for n in chunk.splitlines()] for chunk in input.split("\n\n")]


def total_calories(elves: list[list[int]]) -> list[int]:
    return [sum(elf) for elf in elves]


if __name__ == "__main__":
    main(
        lambda s: max(total_calories(parse(s))),
        lambda s: sum(sorted(total_calories(parse(s)))[-3:]),
    )
