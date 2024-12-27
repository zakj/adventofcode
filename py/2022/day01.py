from aoc import main
from aoc.parse import paras


def total_calories(elves: list[list[int]]) -> list[int]:
    return [sum(elf) for elf in elves]


if __name__ == "__main__":
    main(
        lambda s: max(total_calories(paras(s, int))),
        lambda s: sum(sorted(total_calories(paras(s, int)))[-3:]),
    )
