from aoc import main
from functools import reduce
import math
from dataclasses import dataclass


@dataclass
class Game:
    id: int
    grabs: list[dict[str, int]]


def parse(s: str) -> list[Game]:
    games = []
    for line in s.splitlines():
        [game, rest] = line.split(": ")
        [_, id] = game.split(" ")
        bags = []
        for s in rest.split("; "):
            bag = {}
            for item in s.split(", "):
                [n, c] = item.split(" ")
                bag[c] = int(n)
            bags.append(bag)
        games.append(Game(int(id), bags))
    return games


def is_valid_game(game: Game) -> bool:
    max = {"red": 12, "green": 13, "blue": 14}
    for grab in game.grabs:
        for c, n in grab.items():
            if n > max[c]:
                return False
    return True


def cubes_power(game: Game) -> int:
    mins = {}
    for grab in game.grabs:
        for c, n in grab.items():
            mins[c] = max(mins.get(c, 0), n)
    return math.prod(mins.values())


if __name__ == "__main__":
    main(
        lambda s: sum(g.id for g in parse(s) if is_valid_game(g)),
        lambda s: sum(cubes_power(g) for g in parse(s)),
    )
