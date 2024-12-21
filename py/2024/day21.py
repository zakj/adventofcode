from itertools import pairwise
from math import inf

from aoc import main, progress
from coords import Point, neighbors, subp
from graph_dyn import DiGraph, all_shortest_paths


def parse(s: str):
    pass


class Keypad(DiGraph):
    start: Point
    cur: Point
    keys: dict[str, Point]

    def __init__(self):
        self.cur = self.start
        self.grid = {v: k for k, v in self.keys.items()}
        self.shortest_paths = {}
        for start in self.grid:
            for end in self.grid:
                self.shortest_paths[start, end] = {
                    path_to_key(path) for path in all_shortest_paths(self, start, end)
                }

    def __getitem__(self, p: Point) -> set[Point]:
        return {n for n in neighbors(p) if n in self.grid}


class NumericKeypad(Keypad):
    start = (2, 3)

    keys = {
        "7": (0, 0),
        "8": (1, 0),
        "9": (2, 0),
        "4": (0, 1),
        "5": (1, 1),
        "6": (2, 1),
        "1": (0, 2),
        "2": (1, 2),
        "3": (2, 2),
        "0": (1, 3),
        "A": (2, 3),
    }


class DirectionalKeypad(Keypad):
    start = (2, 0)

    keys = {
        "^": (1, 0),
        "A": (2, 0),
        "<": (0, 1),
        "v": (1, 1),
        ">": (2, 1),
    }


# presses to go to should return all shortest paths
# next higher up should do all shortests paths for all of those

dir_to_key = {
    (0, -1): "^",
    (1, 0): ">",
    (0, 1): "v",
    (-1, 0): "<",
}

from functools import cache


def path_to_key(path: list[Point]) -> str:
    keys = []
    for a, b in pairwise(path):
        keys.append(dir_to_key[subp(b, a)])
    return "".join(keys) + "A"


# TODO with no progress/status, running duration is in the wrong column


@cache
def r(nbots: int, keys: str):
    bot = DirectionalKeypad()
    acc = []
    for c in keys:
        candidates = []
        try:
            bot.shortest_paths[bot.cur, bot.keys[c]]
        except:
            print(bot.cur, bot.keys[c])
            raise
        for keys in bot.shortest_paths[bot.cur, bot.keys[c]]:
            if nbots == 1:
                candidates = [keys]
                break
            else:
                candidates.append(r(nbots - 1, keys))
        acc.append(min(candidates, key=len))
        bot.cur = bot.keys[c]

    return "".join(acc)


@cache
def rr(nbots: int, keys: str) -> int:
    bot = DirectionalKeypad()
    total = 0
    for c in keys:
        min_length = inf
        for nkeys in bot.shortest_paths[bot.cur, bot.keys[c]]:
            if nbots == 1:
                min_length = len(nkeys)
                break
            else:
                min_length = min(min_length, rr(nbots - 1, nkeys))
        total += min_length
        bot.cur = bot.keys[c]
    return total


def keypad_complexity(s: str, bot_count: int) -> int:
    num_bot = NumericKeypad()
    # bots: list[Keypad] = []
    # for _ in range(bot_count):
    #     bots.append(DirectionalKeypad())

    total = 0
    codes = s.splitlines()
    for code in progress(codes):
        numeric = int(code[:-1])
        best = 0
        for c in code:
            options = num_bot.shortest_paths[num_bot.cur, num_bot.keys[c]]
            num_bot.cur = num_bot.keys[c]
            best += min([rr(bot_count, option) for option in options])
        total += numeric * best
    return total

    # total = 0
    # codes = s.splitlines()
    # for code in progress(codes):
    #     numeric = int(code[:-1])
    #     keys = len(r(bots, code))
    #     total += numeric * keys
    # return total


if __name__ == "__main__":
    main(
        lambda s: keypad_complexity(s, 2),
        lambda s: keypad_complexity(s, 25),
        # isolate=0,
    )
