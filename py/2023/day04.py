import re
from dataclasses import dataclass

from aoc import main
from parse import all_numbers, line_parser


@dataclass
class Card:
    winning: set[int]
    held: set[int]
    copies: int = 1


@line_parser
def parse(line: str) -> Card:
    [_, winning, held] = re.split(r"[:|]", line)
    return Card(set(all_numbers(winning)), set(all_numbers(held)))


def points(card: Card) -> int:
    wins = len(card.winning & card.held)
    if wins:
        return 2 ** (wins - 1)
    return 0


def total_cards(cards: list[Card]) -> int:
    for i, card in enumerate(cards):
        wins = len(card.winning & card.held)
        start = i + 1
        for j in range(start, min(start + wins, len(cards))):
            cards[j].copies += card.copies
    return sum(c.copies for c in cards)


if __name__ == "__main__":
    main(
        lambda s: sum(points(c) for c in parse(s)),
        lambda s: total_cards(parse(s)),
    )
