import math
import re
from dataclasses import dataclass

from aoc import main
from parse import all_numbers, line_parser

color_re = re.compile(r"red|green|blue")


@dataclass
class Game:
    id: int
    most: dict[str, int]


@line_parser
def parse(line: str) -> Game:
    nums = all_numbers(line)
    colors = color_re.findall(line)
    id = int(nums.pop(0))
    most = {"red": 0, "green": 0, "blue": 0}
    for num, color in zip(nums, colors):
        most[color] = max(most[color], num)
    return Game(id, most)


def is_valid_game(game: Game) -> bool:
    max = {"red": 12, "green": 13, "blue": 14}
    return all(n <= max[c] for c, n in game.most.items())


def cubes_power(game: Game) -> int:
    return math.prod(game.most.values())


if __name__ == "__main__":
    main(
        lambda s: sum(g.id for g in parse(s) if is_valid_game(g)),
        lambda s: sum(cubes_power(g) for g in parse(s)),
    )
