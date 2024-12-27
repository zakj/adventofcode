from collections import defaultdict
from collections.abc import Callable
from dataclasses import dataclass, field
from operator import and_, ne, or_
from typing import Literal, TypeGuard

from aoc import main
from aoc.parse import paras

type Op = Literal["AND", "OR", "XOR", "VALUE"]
ops: dict[Op, Callable[[bool, bool], bool]] = {
    "AND": and_,
    "OR": or_,
    "XOR": ne,
    "VALUE": lambda a, b: False,  # unused
}


def is_op(s: str) -> TypeGuard[Op]:
    return s in {"AND", "OR", "XOR"}


@dataclass
class Gate:
    out: str
    a: str
    op: Op
    b: str
    value: bool | None = None
    deps: set["Gate"] = field(default_factory=set)

    def __hash__(self) -> int:
        return hash(self.out)


def parse(s: str) -> dict[str, Gate]:
    wires_str, gates_str = paras(s)
    gates: dict[str, Gate] = {}
    deps_map = defaultdict(set)
    for line in wires_str:
        name, value = line.split(": ")
        gates[name] = Gate(name, "", "VALUE", "", bool(int(value)))
    for line in gates_str:
        a, op, b, _, out = line.split(" ")
        assert is_op(op)
        gates[out] = gate = Gate(out, a, op, b)
        deps_map[a].add(gate)
        deps_map[b].add(gate)
    for name, deps in deps_map.items():
        gates[name].deps = deps
    return gates


def resolve(gates: dict[str, "Gate"], name: str) -> bool:
    gate = gates[name]
    if gate.value is None:
        assert gate.a and gate.b and gate.op
        a = resolve(gates, gate.a)
        b = resolve(gates, gate.b)
        gate.value = ops[gate.op](a, b)
    return gate.value


def z_output(s: str) -> int:
    gates = parse(s)
    value = 0
    for i, name in enumerate(sorted(name for name in gates if name[0] == "z")):
        value += 2**i if resolve(gates, name) else 0
    return value


def is_broken(g: Gate) -> bool:
    if g.op == "XOR" and all(w[0] not in "xyz" for w in (g.a, g.b, g.out)):
        return True
    if g.op == "AND" and "x00" not in (g.a, g.b) and any(h.op == "XOR" for h in g.deps):
        return True
    if g.op == "XOR" and "x00" not in (g.a, g.b) and any(h.op == "OR" for h in g.deps):
        return True
    if g.op != "XOR" and g.out[0] == "z" and g.out != "z45":
        return True
    return False


def swap_wires_to_fix(s: str) -> str:
    gates = parse(s)
    broken = sorted(g.out for g in gates.values() if is_broken(g))
    return ",".join(broken)


if __name__ == "__main__":
    main(z_output, swap_wires_to_fix)
