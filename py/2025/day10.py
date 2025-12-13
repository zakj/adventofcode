import re

from aoc import main, progress
from aoc.collections import Bitmask
from aoc.graph import DiGraph, shortest_path_length
from aoc.linalg import to_reduced_row_echelon_form
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


class OfflineMachine[Node: Bitmask](DiGraph):
    def __init__(self, buttons: list[Bitmask]) -> None:
        self.buttons = buttons

    def __getitem__(self, state: Node) -> set[Node]:
        return {state ^ button for button in self.buttons}


def fewest_presses_lights(input: str):
    machines = parse(input)
    total = 0
    for lights, buttons, _joltages in machines:
        machine = OfflineMachine([Bitmask.from_list(b) for b in buttons])
        total += shortest_path_length(machine, 0, Bitmask.from_list(lights))
    return total


def fewest_presses_joltages(input: str):
    machines = parse(input)
    overall_total = 0

    for _lights, buttons, joltages in progress(machines):
        matrix = []
        for joltage_index, joltage in enumerate(joltages):
            row = [0] * len(buttons) + [joltage]
            for button_index, button in enumerate(buttons):
                if joltage_index in button:
                    row[button_index] = 1
            matrix.append(row)
        rref = to_reduced_row_echelon_form(matrix)

        coeff_count = len(buttons)
        pivot_rows: dict[int, int] = {}
        for i, row in enumerate(rref):
            if 1 in row:
                pivot_rows[row.index(1)] = i  # pyright: ignore[reportArgumentType]
        free_cols = [col for col in range(coeff_count) if col not in pivot_rows]

        def compute_solution(free_values: tuple[int, ...]) -> list[int] | None:
            solution = [0] * (coeff_count)
            for i, col in enumerate(free_cols):
                solution[col] = free_values[i]
            for col, row in pivot_rows.items():
                val = rref[row][-1] - sum(
                    rref[row][free_cols[i]] * free_values[i]
                    for i in range(len(free_cols))
                )
                if not val.is_integer() or not 0 <= val <= max_presses:
                    return None
                solution[col] = int(val)
            return solution

        def bounded_tuples(n, max_sum):
            if n == 0:
                yield ()
                return
            for first in range(max_sum + 1):
                for rest in bounded_tuples(n - 1, max_sum - first):
                    yield (first,) + rest

        # TODO optimize; index 189 is the slowest one
        max_presses = max(joltages)
        min_sum = None
        for free_vals in bounded_tuples(len(free_cols), max_presses):
            solution = compute_solution(free_vals)
            if solution is None:
                continue
            total = sum(solution)
            min_sum = min(total, min_sum) if min_sum is not None else total
        assert min_sum is not None
        overall_total += min_sum

    return overall_total


if __name__ == "__main__":
    main(
        fewest_presses_lights,
        fewest_presses_joltages,
    )
