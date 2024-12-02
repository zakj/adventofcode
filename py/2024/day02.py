from aoc import main
from parse import all_numbers


def parse(s: str):
    pass


def is_safe(nums):
    last, nums = nums[0], nums[1:]
    direction = None
    for cur in nums:
        diff = abs(cur - last)
        if diff < 1 or diff > 3:
            # print("  bad diff", diff, cur, last)
            return False
        if direction is None:
            direction = "increase" if cur > last else "decrease"
        if direction == "increase" and cur <= last:
            # print("  bad increase")
            return False
        if direction == "decrease" and cur >= last:
            # print("  bad decrease")
            return False
        last = cur

    return True


def is_safe2(nums):
    last, nums = nums[0], nums[1:]
    direction = "increase" if nums[1] > nums[0] else "decrease"
    for cur in nums:
        diff = abs(cur - last)
        if diff < 1 or diff > 3:
            fails += 1
        elif direction == "increase" and cur <= last:
            fails += 1
        elif direction == "decrease" and cur >= last:
            fails += 1
        last = cur

    return fails <= 1


def part1(s: str) -> int:
    safe = 0
    for line in s.splitlines():
        record = all_numbers(line)
        if is_safe(record):
            safe += 1
    return safe


def part2(s: str) -> int:
    safe = 0
    for line in s.splitlines():
        record = all_numbers(line)
        if is_safe(record):
            safe += 1
        else:
            found_safe = False
            for i in range(len(record)):
                cp = record[:]
                del cp[i]
                if is_safe(cp):
                    found_safe = True
            if found_safe:
                safe += 1

    return safe


if __name__ == "__main__":
    main(
        part1,
        part2,
    )
