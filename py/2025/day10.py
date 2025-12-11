import re
from collections.abc import Iterable
from itertools import combinations_with_replacement
from typing import Self

from aoc import main, progress
from aoc.graph import DiGraph, shortest_path_length
from aoc.parse import all_numbers, line_parser

SCHEMATIC_RE = re.compile(r"^\[([.#]+)] (\(.*\)) {(.*)}")
BUTTONS_RE = re.compile(r"\(([\d,]+)\)")


@line_parser
def parse(line: str):
    match = SCHEMATIC_RE.match(line)
    if not match:
        raise ValueError
    lights_str, buttons_str, joltages_str = match.groups()
    lights = {i for i, v in enumerate(lights_str) if v == "#"}
    buttons = [all_numbers(b) for b in BUTTONS_RE.findall(buttons_str)]
    joltages = all_numbers(joltages_str)
    return lights, buttons, joltages


class Bitmask(int):
    @classmethod
    def from_list(cls, indexes: Iterable[int]) -> Self:
        return cls(sum(1 << i for i in indexes))

    def on(self, i: int, /) -> Self:
        return self.__class__(self | (1 << i))

    def off(self, i: int, /) -> Self:
        return self.__class__(self & ~(1 << i))

    def toggle(self, i: int, /) -> Self:
        return self.__class__(self ^ (1 << i))

    def __contains__(self, i: int, /) -> bool:
        return bool(self & (1 << i))

    def __and__(self, value: int | Self, /) -> Self:
        return self.__class__(super().__and__(value))

    def __invert__(self) -> Self:
        return self.__class__(super().__invert__())

    def __or__(self, value: int | Self, /) -> Self:
        return self.__class__(super().__or__(value))

    def __xor__(self, value: int | Self, /) -> Self:
        return self.__class__(super().__xor__(value))

    __rand__ = __and__
    __ror__ = __or__
    __rxor__ = __xor__


class OfflineMachine2[Node: Bitmask](DiGraph):
    def __init__(self, buttons: list[Bitmask]) -> None:
        self.buttons = buttons

    def __getitem__(self, state: Node) -> set[Node]:
        return {state ^ button for button in self.buttons}


def part1_bitmask(input: str):
    machines = parse(input)
    total = 0
    for lights, buttons, _joltages in machines:
        machine = OfflineMachine2([Bitmask.from_list(b) for b in buttons])
        total += shortest_path_length(machine, 0, Bitmask.from_list(lights))
    return total


class OfflineMachine[Node: set[int]](DiGraph):
    def __init__(self, buttons: list[list[int]]) -> None:
        self.buttons = buttons

    def __getitem__(self, state: Node) -> set[Node]:
        neighbors = set()
        for button in self.buttons:
            neighbor = state
            for idx in button:
                neighbor ^= {idx}
            neighbors.add(neighbor)
        return neighbors


def part1(input: str):
    machines = parse(input)
    total = 0
    for lights, buttons, _joltages in machines:
        machine = OfflineMachine(buttons)
        presses = shortest_path_length(machine, frozenset(), lights)
        total += presses
    return total


def part2(input: str):
    machines = parse(input)
    machines = parse(
        "[...###] (1,2,4) (2,4,5) (4,5) (0,5) (0,1,2,3,4) (0,1,5) (0,3) (3,5) {55,40,39,33,42,56}"
    )

    # [...###] (1,2,4) (2,4,5) (4,5) (0,5) (0,1,2,3,4) (0,1,5) (0,3) (3,5) {55,40,39,33,42,56}
    #
    # (0,5) (0,1,2,3,4) (0,1,5) (0,3)
    # must be pressed a combined total of 55 times
    # (1,2,4) (0,1,2,3,4) (0,1,5) -> 40
    # (1,2,4) (2,4,5) (0,1,2,3,4) -> 39
    # (0,1,2,3,4) (0,3) (3,5) -> 33
    # (1,2,4) (2,4,5) (4,5) (0,1,2,3,4) -> 42
    # (2,4,5) (4,5) (0,5) (0,1,5) (3,5) -> 56
    #
    # n = total presses
    # k = button count
    # comb(n + k - 1, k - 1) is total combinations
    # too many to iterate
    # but each permutation reduces the search space for the other buttons, so maybe we can?

    # what if instead I pressed the buttons that affect the most indexes first?
    # could a simple DFS work that way?
    # for biggest button: max presses on that button is the smallest index it affects
    # I could get the max presses per button
    # and the min presses per set of buttons
    # what would that look like?
    #
    # (0,5) (0,1,2,3,4) (0,1,5) (0,3) -> 55 01234 39 -> 16
    # (1,2,4) (0,1,2,3,4) (0,1,5) -> 40 01234 39 -> 1
    # (1,2,4) (2,4,5) (0,1,2,3,4) -> 39 01234 39 -> 0
    # (0,1,2,3,4) (0,3) (3,5) -> 33
    # (1,2,4) (2,4,5) (4,5) (0,1,2,3,4) -> 42 01234 39 -> 3
    # (2,4,5) (4,5) (0,5) (0,1,5) (3,5) -> 56
    #
    # (01234) 39
    # then we're stuck, 245 and 015

    total = 0
    for _lights, buttons, joltages in progress(machines):
        buttons_affecting_index = {
            i: [b for b in buttons if i in b] for i in range(len(joltages))
        }

        # n = total presses to distribute
        # [(a, b, n - a - b) for a in range(n + 1) for b in range(n + 1 - a)]
        # but this doesn't expand well to dynamic number of buttons :/

        state = joltages
        for i in range(len(joltages)):
            for presses in combinations_with_replacement(
                buttons_affecting_index[i], joltages[i]
            ):
                nstate = list(state)
                for button in presses:
                    for idx in button:
                        nstate[idx] -= 1

        # for each combination of presses to get the first index
        # reduce the target joltages as needed
        # then recompute what's left
        # first eliminate joltages that are affected by the fewest buttons
        # iterate over all integer partitions of this value and press the buttons accordingly
        # then recurse with the reduced joltage values and remaining other buttons until all joltage values are 0

        # index_with_lowest_presses = joltages.index(min(joltages))
        # print(list(combinations_with_replacement(cur_buttons, lowest_presses))[100])
        # print("--", buttons, joltages)
        # machine = OnlineMachine(buttons, joltages)
        # presses = shortest_path_length(machine, (0,) * len(joltages), tuple(joltages))
        # total += presses
    return total


if __name__ == "__main__":
    main(
        # part1,
        part1_bitmask,
        part2,
        # isolate=0,
    )
