from aoc import main
from aoc.util import mod_range

Game = tuple[int, int]


def parse(s: str) -> list[Game]:
    return [
        ("ABC".index(a) + 1, "XYZ".index(b) + 1)
        for a, b in [line.split(" ", 2) for line in s.splitlines()]
    ]


def score(a: int, b: int) -> int:
    score = b
    if a == b:
        score += 3
    elif mod_range(a + 1, 1, 4) == b:
        score += 6
    return score


def strategize(game: Game) -> Game:
    opp, strategy = game
    DELTAS = {1: -1, 2: 0, 3: 1}
    return opp, mod_range(opp + DELTAS[strategy], 1, 4)


if __name__ == "__main__":
    main(
        lambda s: sum(score(a, b) for a, b in parse(s)),
        lambda s: sum(score(*strategize(game)) for game in parse(s)),
    )
