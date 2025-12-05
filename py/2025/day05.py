from dataclasses import dataclass

from aoc import main
from aoc.parse import paras


@dataclass(eq=True)
class Range:
    start: int
    end: int

    @staticmethod
    def union(*ranges: "Range") -> "list[Range]":
        union = []
        last = None
        for x in sorted(ranges):
            if last and last.end >= x.start - 1:
                last.end = max(last.end, x.end)
            else:
                last = x
                union.append(last)
        return union

    def __lt__(self, other: "Range") -> bool:
        return self.start < other.start

    def __len__(self) -> int:
        return self.end - self.start + 1

    def __contains__(self, other: int) -> bool:
        return self.start <= other <= self.end


def part1(input: str):
    id_ranges, ids = paras(input)
    ids = {int(n) for n in ids}
    ranges: list[Range] = []
    for range_str in id_ranges:
        start, end = range_str.split("-")
        ranges.append(Range(int(start), int(end)))
    ranges = Range.union(*ranges)
    count = 0
    for id in ids:
        for range in ranges:
            if id in range:
                count += 1
                break
    return count


def part2(input: str):
    id_ranges, _ = paras(input)
    ranges: list[Range] = []
    for range_str in id_ranges:
        start, end = range_str.split("-")
        ranges.append(Range(int(start), int(end)))
    ranges = Range.union(*ranges)
    return sum(len(r) for r in ranges)


if __name__ == "__main__":
    main(
        part1,
        part2,
    )
