from aoc import main


def part1(input: str):
    banks = input.splitlines()
    total = 0
    for batteries in banks:
        # find highest number that's not at the end
        # find highest next number
        highest = 0
        highest_index = -1
        for i, battery in enumerate(batteries[:-1]):
            if int(battery) > highest:
                highest = int(battery)
                highest_index = i
        second = 0
        for i, battery in enumerate(batteries[highest_index + 1 :]):
            if int(battery) > second:
                second = int(battery)
        total += int(str(highest) + str(second))
    return total


def find_highest(xs: str, start: int, end: int | None) -> tuple[int, int]:
    highest = 0
    index = -1
    for i, x in enumerate(xs[:end]):
        if i < start:
            continue
        if int(x) > highest:
            highest = int(x)
            index = i
    return highest, index


def part2(input: str):
    banks = input.splitlines()
    total = 0
    digits = 12
    for batteries in banks:
        rv = []
        last = -1
        for dig in range(digits, 0, -1):
            hi, last = find_highest(
                batteries, last + 1, -(dig - 1) if dig > 1 else None
            )
            rv.append(str(hi))
        total += int("".join(rv))
    return total


if __name__ == "__main__":
    main(
        part1,
        part2,
        # isolate=0,
    )
