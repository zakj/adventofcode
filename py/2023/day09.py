from aoc import main
from parse import all_numbers


def parse(s: str) -> int:
    tot = 0
    for line in s.splitlines():
        nums = [all_numbers(line)]
        while any(n != 0 for n in nums[-1]):
            prev = nums[-1][0]
            diffs = []
            for n in nums[-1][1:]:
                diffs.append(n - prev)
                prev = n
            nums.append(diffs)
        tot += sum([line[-1] for line in nums])
    return tot


def part2(s: str) -> int:
    tot = 0
    for line in s.splitlines():
        nums = [all_numbers(line)]
        while any(n != 0 for n in nums[-1]):
            prev = nums[-1][0]
            diffs = []
            for n in nums[-1][1:]:
                diffs.append(n - prev)
                prev = n
            nums.append(diffs)

        prev = nums[-1][0]
        for line in reversed(nums[:-1]):
            prev = line[0] - prev
        tot += prev
    return tot


if __name__ == "__main__":
    main(
        lambda s: parse(s),
        lambda s: part2(s),
    )
