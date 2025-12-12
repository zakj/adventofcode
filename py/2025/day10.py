import re
from itertools import combinations_with_replacement, product

from aoc import main, progress
from aoc.collections import Bitmask
from aoc.graph import DiGraph, shortest_path_length
from aoc.linalg import mprint, to_reduced_row_echelon_form
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


def part2_ge(input: str):
    machines = parse(input)
    overall_total = 0
    for _lights, buttons, joltages in machines:
        matrix = []
        for i, joltage in enumerate(joltages):
            row = [0] * len(buttons)
            for j, button in enumerate(buttons):
                if i in button:
                    row[j] = 1
            matrix.append(row + [joltage])

        # row-echelon/triangular form.

        # now convert to reduced row-echelon form
        # operations: swap two rows; multiply a row by a non-zero scalar; add a scalar multiple of one row to another
        # matrix = sorted(matrix, reverse=True)
        from pprint import pprint

        pprint(matrix)

        num_rows = len(matrix)
        num_cols = len(matrix[0])
        m = matrix
        for row in range(num_rows - 1, -1, -1):
            pivot_col = m[row].index(1)
            for above_row in range(row):
                if m[above_row][pivot_col] != 0:
                    f = m[above_row][pivot_col]
                    m[above_row] = [
                        m[above_row][i] - f * m[row][i] for i in range(num_cols)
                    ]
        num_vars = len(buttons)
        max_search = max(joltages)

        pivot_rows: dict[int, int] = {}
        for i, row in enumerate(m):
            for j in range(num_vars):
                if row[j] == 1 and all(m[k][j] == 0 for k in range(num_rows) if k != i):
                    pivot_rows[j] = i
                    break

        free_cols = [j for j in range(num_vars) if j not in pivot_rows]

        def compute_solution(free_values: tuple[int, ...]) -> list[int]:
            solution = [0] * num_vars
            for i, col in enumerate(free_cols):
                solution[col] = free_values[i]

            for pivot_col, row in pivot_rows.items():
                solution[pivot_col] = m[row][-1] - sum(
                    m[row][free_cols[i]] * free_values[i] for i in range(len(free_cols))
                )

            return solution

        min_sum = None
        for free_vals in product(range(max_search + 1), repeat=(len(free_cols))):
            solution = compute_solution(free_vals)
            if all(v >= 0 for v in solution):
                total = sum(solution)
                if min_sum is None or total < min_sum:
                    min_sum = total

        assert min_sum is not None
        overall_total += min_sum
    return overall_total

    # now we're in reduced row-echelon form: each "pivot" (the first nonzero
    # entry in a row) has no nonzero entries above it in its column

    # -----
    # now convert to reduced row-echelon form
    # operations: interchange two rows; multiply a row by a non-zero scalar; add a scalar multiple of one row to another

    # A = matrix
    # h, m = 0, len(matrix)
    # k, n = 0, len(buttons)
    # while h < m and k < n:
    #     i_max = max(range(h, m), key=lambda i: abs(A[i][k]))
    #     if A[i_max][k] == 0:
    #         k += 1
    #     else:
    #         A[h], A[i_max] = A[i_max], A[h]
    #         for i in range(h + 1, m):
    #             f = A[i][k] / A[h][k]
    #             A[i][k] = 0
    #             for j in range(k + 1, n):
    #                 A[i][j] = A[i][j] - A[h][j] * f
    #         h += 1
    #         k += 1
    #     pprint(A)

    # mat = matrix
    # N = len(buttons)
    # for k in range(N):
    #     # print(f"{k=} {N=} {list(range(k, N))=}")
    #     i_max = max(range(k, len(matrix)), key=lambda i: abs(mat[i][k]))
    #     print(f"{i_max=} {k=} {mat[i_max][k]}")
    #     assert mat[i_max][k] != 0
    #     mat[k], mat[i_max] = mat[i_max], mat[k]

    #     for i in range(k + 1, N):
    #         f = mat[i][k] / mat[k][k]
    #         mat[i][k + 1 :] = [
    #             mat[i][j] - f * mat[k][j] for j in range(k + 1, N + 1)
    #         ]
    #         mat[i][k] = 0
    # print(mat)


def part2_round2(input: str):
    machines = parse(input)
    overall_total = 0

    for _lights, buttons, joltages in progress(machines[:10]):
        matrix = []
        for i, joltage in enumerate(joltages):
            row = [0] * len(buttons)
            for j, button in enumerate(buttons):
                if i in button:
                    row[j] = 1
            matrix.append(row + [joltage])

        rref = to_reduced_row_echelon_form(matrix)
        coeff_count = len(rref[0]) - 1
        pivot_rows: dict[int, int] = {}
        for i, row in enumerate(rref):
            if 1 in row:
                pivot_rows[row.index(1)] = i
        free_cols = [col for col in range(coeff_count) if col not in pivot_rows]

        def compute_solution(free_values: tuple[int, ...]) -> list[int]:
            solution = [0] * (coeff_count)
            for i, col in enumerate(free_cols):
                solution[col] = free_values[i]
            for col, row in pivot_rows.items():
                val = rref[row][-1] - sum(
                    rref[row][free_cols[i]] * free_values[i]
                    for i in range(len(free_cols))
                )
                if val.denominator != 1:
                    raise ValueError
                solution[col] = int(val)
            return solution

        max_presses = max(joltages)
        min_sum = None
        # TODO optimize
        for free_vals in product(range(max_presses + 1), repeat=len(free_cols)):
            try:
                solution = compute_solution(free_vals)
            except ValueError:
                continue
            if all(v >= 0 and v.is_integer() for v in solution):
                total = sum(solution)
                if min_sum is None:
                    min_sum = total
                else:
                    min_sum = min(total, min_sum)

        if min_sum is None:
            mprint(matrix)
            mprint(rref)
        assert min_sum is not None
        # print(min_sum)
        overall_total += min_sum

    return overall_total


if __name__ == "__main__":
    main(
        # part1,
        part1_bitmask,
        # part2,
        # part2_ge,
        part2_round2,
        # isolate=0,
        # profile=1,
    )
