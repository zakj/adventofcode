from collections import Counter
from enum import IntEnum, auto
from typing import Callable

from aoc import main

VALUES = "23456789TJQKA"
VALUES_JOKERS = "23456789TQKA"


class Value(IntEnum):
    HIGH_CARD = auto()
    PAIR = auto()
    TWO_PAIRS = auto()
    THREE_OF_A_KIND = auto()
    FULL_HOUSE = auto()
    FOUR_OF_A_KIND = auto()
    FIVE_OF_A_KIND = auto()


def hand_value(hand):
    cards = [VALUES.index(c) for c in hand[0]]
    counter = Counter(cards)
    uniques = len(counter)
    most_common = counter.most_common()[0][1]
    if uniques == 1:
        return (Value.FIVE_OF_A_KIND, cards)
    if uniques == 2 and most_common == 4:
        return (Value.FOUR_OF_A_KIND, cards)
    if uniques == 2:
        return (Value.FULL_HOUSE, cards)
    if uniques == 3 and most_common == 3:
        return (Value.THREE_OF_A_KIND, cards)
    if uniques == 3:
        return (Value.TWO_PAIRS, cards)
    if uniques == 4:
        return (Value.PAIR, cards)
    return (Value.HIGH_CARD, cards)


def hand_value_jokers(hand):
    cards = hand[0]
    most_common = Counter(c for c in cards if c != "J").most_common()
    if most_common:
        value = hand_value((cards.replace("J", most_common[0][0]), 1))[0]
    else:
        value = Value.FIVE_OF_A_KIND
    cards = [VALUES_JOKERS.find(c) for c in cards]
    return (value, cards)


# TODO: more specific typing for sortkey?
def winnings(s: str, sortkey: Callable):
    hands = []
    for line in s.splitlines():
        cards = line[:5]
        bid = int(line[5:])
        hands.append((cards, bid))
    hands.sort(key=sortkey)
    return sum(rank * bid for rank, (_, bid) in enumerate(hands, start=1))


if __name__ == "__main__":
    main(
        lambda s: winnings(s, hand_value),
        lambda s: winnings(s, hand_value_jokers),
    )
