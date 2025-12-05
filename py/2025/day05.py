from aoc import main
from aoc.parse import paras
from aoc.util import Range


def parse(input: str) -> tuple[list[Range], list[int]]:
    ranges_str, ids_str = paras(input)
    ranges = []
    for range_str in ranges_str:
        start, end = range_str.split("-")
        ranges.append(Range(int(start), int(end)))
    ranges = Range.union(*ranges)
    ids = [int(n) for n in ids_str]
    return ranges, ids


def count_fresh_ingredients(input: str):
    ranges, ids = parse(input)
    return sum(1 for id in ids if any(id in r for r in ranges))


def count_fresh_ids(input: str):
    ranges, _ = parse(input)
    return sum(len(r) for r in ranges)


if __name__ == "__main__":
    main(
        count_fresh_ingredients,
        count_fresh_ids,
    )
