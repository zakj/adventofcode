import re

from aoc import main


def calibrate(line: str) -> int:
    digits = re.findall(r"\d", line)
    return int(digits[0] + digits[-1])


def convert_names(s: str) -> str:
    NUMS = ["one", "two", "three", "four", "five", "six", "seven", "eight", "nine"]
    for i, name in enumerate(NUMS):
        s = s.replace(name, name[0] + str(i + 1) + name[1:])
    return s


if __name__ == "__main__":
    main(
        lambda s: sum(calibrate(line) for line in s.splitlines()),
        lambda s: sum(calibrate(line) for line in convert_names(s).splitlines()),
    )
