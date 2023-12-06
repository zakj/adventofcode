from aoc import main
from parse import all_numbers


def count_wins(t: int, d: int) -> int:
    wins = 0
    for speed in range(1, t):
        if speed * (t - speed) > d:
            wins += 1
    return wins


def part1(s: str) -> int:
    [time, distance] = [all_numbers(line) for line in s.splitlines()]
    races = zip(time, distance)
    wins = 1
    for t, d in races:
        wins *= count_wins(t, d)
    return wins


def part2(s: str) -> int:
    [time, distance] = [all_numbers(line.replace(" ", "")) for line in s.splitlines()]
    races = zip(time, distance)
    wins = 1
    for t, d in races:
        wins *= count_wins(t, d)
    return wins


if __name__ == "__main__":
    main(
        lambda s: part1(s),
        lambda s: part2(s),
    )
