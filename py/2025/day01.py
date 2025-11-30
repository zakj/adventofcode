from aoc import main
from aoc.parse import first_number, line_parser

start = 50


@line_parser
def parse(line: str):
    return [line[0], first_number(line)]


def part1(input: str):
    instr = parse(input)
    cur = 50
    zerocount = 0
    for dir, num in instr:
        if dir == "L":
            cur -= num
            if cur < 0:
                cur += 100
        elif dir == "R":
            cur += num
        else:
            raise ValueError
        cur = cur % 100
        if cur == 0:
            zerocount += 1
    return zerocount


def part2(input: str):
    instr = parse(input)
    print(instr)
    cur = 50
    zerocount = 0
    for dir, num in instr:
        delta = 1
        if dir == "L":
            delta = -1
        for i in range(num):
            cur += delta
            if cur < 0:
                cur += 100
            cur = cur % 100
            if cur == 0:
                zerocount += 1
    return zerocount


if __name__ == "__main__":
    main(part1, part2)
