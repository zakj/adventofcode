from dataclasses import dataclass
from itertools import combinations
from operator import and_, ne, or_

from aoc import main, progress
from parse import paras


@dataclass(eq=True, frozen=True)
class Gate:
    a: str
    b: str
    op: str
    out: str

    def __repr__(self) -> str:
        ops = {"AND": "&", "OR": "|", "XOR": "^"}
        return f"{self.out}({self.a} {ops.get(self.op, '?')} {self.b})"

    def display(self, gates: dict[str, "Gate"]) -> str:
        ops = {"AND": "&", "OR": "|", "XOR": "^"}
        a = gates[self.a].display(gates) if self.a in gates else self.a
        b = gates[self.b].display(gates) if self.b in gates else self.b
        return f"{self.out}({a} {ops.get(self.op, '?')} {b})"

    def with_new_output(self, out: str) -> "Gate":
        return Gate(self.a, self.b, self.op, out)


type Wires = dict[str, int]


def parse(s: str) -> tuple[Wires, dict[str, Gate]]:
    wires_str, gates_str = paras(s)
    wires = {}
    for line in wires_str:
        name, value = line.split(": ")
        wires[name] = bool(int(value))
    gates = {}
    for line in gates_str:
        a, op, b, _, out = line.split(" ")
        gates[out] = Gate(a, b, op, out)
    return wires, gates


def resolve_gates(wires: Wires, gates: dict[str, Gate]) -> Wires:
    ops = {"AND": and_, "OR": or_, "XOR": ne}
    wires = wires.copy()
    queue = {gate for wire, gate in gates.items() if wire not in wires}
    while queue:
        todo = {gate for gate in queue if gate.a in wires and gate.b in wires}
        if not todo:  # unresolvable
            break
        queue -= todo
        for gate in todo:
            wires[gate.out] = ops[gate.op](wires[gate.a], wires[gate.b])
    return wires


def wire_values(wires: Wires, prefix: str) -> int:
    matching_wires = reversed(
        sorted((w, v) for w, v in wires.items() if w[0] == prefix)
    )
    return int("".join(str(int(v)) for w, v in matching_wires), 2)


def z_output(s: str) -> int:
    wires, gates = parse(s)
    wires = resolve_gates(wires, gates)
    return wire_values(wires, "z")


type Operation = str | tuple[Operation, str, Operation]


def check(gates: dict[str, Gate], out: str, expected: Operation) -> set[str]:
    if expected == "*":
        return set()

    if out not in gates:
        if expected == out:
            return set()
        return {out}

    left, op, right = expected
    gate = gates[out]
    if op != gate.op:
        return {out}

    options = [
        check(gates, gate.a, left) | check(gates, gate.b, right),
        check(gates, gate.b, left) | check(gates, gate.a, right),
    ]
    return min(options, key=len)


def swap_wires_to_fix(s: str) -> str:
    initial_wires, gates = parse(s)

    x_val = wire_values(initial_wires, "x")
    y_val = wire_values(initial_wires, "y")
    goal_z_val = x_val + y_val

    wrong_wires = set[str]()
    for n in range(2, 45):
        # https://www.geeksforgeeks.org/full-adder-in-digital-logic/
        # A xor B -> x
        # Cin xor x -> sum
        # Cin and x -> y
        # Cin and b -> z
        # y or z -> Cout
        last_x = f"x{n - 1:02}"
        last_y = f"y{n - 1:02}"
        res = check(
            gates,
            f"z{n:02}",
            (
                (f"x{n:02}", "XOR", f"y{n:02}"),
                "XOR",
                ((last_x, "AND", last_y), "OR", ((last_x, "XOR", last_y), "AND", "*")),
            ),
        )
        if res:
            wrong_wires |= res

    pairs = combinations(wrong_wires, 2)
    for guess in progress(combinations(pairs, 4)):
        gates_copy = gates.copy()
        for a, b in guess:
            gates_copy[a] = gates_copy[a].with_new_output(b)
            gates_copy[b] = gates_copy[b].with_new_output(a)
        wires = resolve_gates(initial_wires, gates_copy)
        if wire_values(wires, "z") == goal_z_val:
            # TODO: getting multiple possibilities here
            return ",".join(sorted(w for wires in guess for w in wires))
    raise ValueError("not found")


# unused
def get_wrong_indexes(cur: int, goal: int) -> list[int]:
    value = reversed(bin(cur ^ goal)[2:])
    return [i for i, v in enumerate(value) if v == "1"]


# unused
def show_tree(wire: str, gates: dict[str, Gate], max_depth=3):
    queue = [wire]
    relevant_wires = {wire}
    for _ in range(max_depth):
        nq = []
        for cur in queue:
            if cur in gates:
                relevant_wires |= {gates[cur].a, gates[cur].b}
        queue = nq
    print(gates[wire].display({k: v for k, v in gates.items() if k in relevant_wires}))


# TODO: optimize part 2
if __name__ == "__main__":
    main(z_output, swap_wires_to_fix)
