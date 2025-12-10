import re

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


class OfflineMachine[Node: set[int]](DiGraph):
    def __init__(self, buttons: list[list[int]]) -> None:
        self.buttons = buttons

    def __getitem__(self, on: Node) -> set[Node]:
        neighbors = set()
        for button in self.buttons:
            neighbor = on
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


class OnlineMachine[Node: set[int]](DiGraph):
    def __init__(self, buttons: list[list[int]], max_joltages: list[int]) -> None:
        self.buttons = buttons
        self.max_joltages = max_joltages

    def __getitem__(self, state: Node) -> set[Node]:
        neighbors = set()
        for button in self.buttons:
            neighbor = list(state)
            for idx in button:
                neighbor[idx] += 1
            over = False
            for i, v in enumerate(neighbor):
                if v > self.max_joltages[i]:
                    over = True
            if over:
                continue
            # print(f"{state=} {button=} {neighbor=}")
            neighbors.add(tuple(neighbor))
        return neighbors


# XXX this won't work
def part2(input: str):
    machines = parse(input)
    total = 0
    for _lights, buttons, joltages in progress(machines):
        # print("--", buttons, joltages)
        machine = OnlineMachine(buttons, joltages)
        presses = shortest_path_length(machine, (0,) * len(joltages), tuple(joltages))
        total += presses
    return total


if __name__ == "__main__":
    main(
        part1,
        part2,
        # isolate=0,
    )
