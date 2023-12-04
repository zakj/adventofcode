import re

from aoc import main
from parse import all_numbers


def parse(s: str):
    tot = 0
    for line in s.splitlines():
        [card, winning, held] = re.split(r"[:|]", line)
        winning = all_numbers(winning)
        held = all_numbers(held)
        overlap = set(winning) & set(held)
        if overlap:
            tot += 2 ** (len(overlap) - 1)
    return tot


def parse2(s: str):
    tot = 0
    cards = []
    for line in s.splitlines():
        [card, winning, held] = re.split(r"[:|]", line)
        card = all_numbers(card)[0]
        winning = set(all_numbers(winning))
        held = set(all_numbers(held))
        cards.append([card, winning, held, 1])
    print(f"{cards=}")
    for i, (card, winning, held, copies) in enumerate(cards):
        wins = len(winning & held)
        print(f"{wins=}")
        for j in range(wins):
            if i + j + 1 > len(cards) - 1:
                break
            cards[i + j + 1][3] += copies
    return sum(copies for [*_, copies] in cards)


if __name__ == "__main__":
    main(
        lambda s: parse(s),
        lambda s: parse2(s),
    )
