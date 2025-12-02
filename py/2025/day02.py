from aoc import main


def part1(input: str):
    ranges_in = input.split(",")
    ranges = []
    for s in ranges_in:
        lo, hi = s.split("-")
        ranges.append((int(lo), int(hi)))
    invalid = []
    for lo, hi in ranges:
        # ONLY of some sequence repeated twice
        for value in range(lo, hi + 1):
            s = str(value)
            if len(s) % 2 != 0:
                continue
            left = s[: len(s) // 2]
            right = s[len(s) // 2 :]
            if left == right:
                invalid.append(value)

    return sum(invalid)


def part2(input: str):
    ranges_in = input.split(",")
    ranges = []
    for s in ranges_in:
        lo, hi = s.split("-")
        ranges.append((int(lo), int(hi)))
    invalid = []
    for lo, hi in ranges:
        for value in range(lo, hi + 1):
            s = str(value)
            for cut in range(1, len(s)):
                pat = s[:cut]
                repeat = len(s) // len(pat)
                if pat * repeat == s:
                    invalid.append(value)
                    break

    return sum(invalid)


if __name__ == "__main__":
    main(
        part1,
        part2,
        # isolate=0,
    )
