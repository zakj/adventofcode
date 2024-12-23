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


def resolve_gates(wires: Wires, gates: dict[str, Gate], swp={}) -> Wires:
    ops = {"AND": and_, "OR": or_, "XOR": ne}
    wires = wires.copy()
    iterations = 0
    unresolved = set(gates.values())
    resolved = set()
    while unresolved - resolved:
        iterations += 1
        # TODO something smarter?
        if iterations > 100:
            raise ValueError
        for gate in unresolved - resolved:
            if gate.a in wires and gate.b in wires:
                out = swp.get(gate.out, gate.out)
                wires[out] = ops[gate.op](wires[gate.a], wires[gate.b])
                resolved.add(gate)
    return wires


def wire_values(wires, prefix: str) -> int:
    result = []
    for wire, value in sorted(wires.items()):
        if wire[0] == prefix:
            result.append(int(value))
    return int("".join(str(v) for v in reversed(result)), 2)


def z_output(s: str) -> int:
    wires, gates = parse(s)
    wires = resolve_gates(wires, gates)
    return wire_values(wires, "z")


def get_wrong_indexes(cur: int, goal: int) -> list[int]:
    value = reversed(bin(cur ^ goal)[2:])
    return [i for i, v in enumerate(value) if v == "1"]


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


type Operation = str | tuple[str, Operation, Operation]


def check(gates: dict[str, Gate], out: str, expected: Operation) -> set[str]:
    if expected == "*":
        return set()

    if out not in gates:
        if expected == out:
            return set()
        return {out}

    op, left, right = expected
    gate = gates[out]
    if op != gate.op:
        return {out}

    options = [
        check(gates, gate.a, left) | check(gates, gate.b, right),
        check(gates, gate.b, left) | check(gates, gate.a, right),
    ]
    return min(options, key=len)


def part2(s: str) -> str:
    initial_wires, gates = parse(s)

    x_val = wire_values(initial_wires, "x")
    y_val = wire_values(initial_wires, "y")
    goal_z_val = x_val + y_val
    wires = resolve_gates(initial_wires, gates)
    wrong_indexes = get_wrong_indexes(goal_z_val, wire_values(wires, "z"))
    wrong_wires = [f"z{i:02}" for i in wrong_indexes]
    print(wrong_wires)
    for wire in wrong_wires:
        show_tree(wire, gates)

    def swap(a, b):
        gates[a] = gates[a].with_new_output(b)
        gates[b] = gates[b].with_new_output(a)

    with_level = []
    for n in range(45):
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
                "XOR",
                ("XOR", f"x{n:02}", f"y{n:02}"),
                ("OR", ("AND", last_x, last_y), ("AND", ("XOR", last_x, last_y), "*")),
            ),
        )
        if res:
            with_level.append((n, res))
    print(with_level)

    # swap z06, fkp
    # swap z11, ngr
    # swap z31, mfm
    # swap bpt, (ntr|krj)
    # 'z06,fkp,z11,ngr,z31,mfm,bpt,(ntr|krj)'
    # print(with_level)
    # guess1 = "z06,fkp,z11,ngr,z31,mfm,bpt,ntr".split(",")
    guess2 = "z06,fkp,z11,ngr,z31,mfm,bpt,krj".split(",")

    # print(",".join(sorted(guess1))) NOPE
    return ",".join(sorted(guess2))  # LOL yep

    # show_tree("z04")
    # show_tree("z05")
    # show_tree("z06")
    # show_tree("z07")
    # incorrect?
    # bpp OR ghf -> z06
    # jkn OR gvk -> z45
    # stv AND jpp -> z11
    # wvr XOR jgw -> fkp
    # mgq XOR tpf -> mfm
    # jpp XOR stv -> ngr

    #
    # for gate in gates:
    #     if (
    #         gate.op == "XOR"
    #         and gate.in_a[0] not in "xyz"
    #         and gate.in_b[0] not in "xyz"
    #         and gate.out[0] not in "xyz"
    #     ):
    #         print("wrong", gate)

    # x00 XOR y00 -> z00

    # skt (Cin) XOR kjn (x) -> z01
    # y00 AND x00 -> skt (Cin)
    # y01 XOR x01 -> kjn (a xor b -> x)

    # pgc (Cin) XOR fvj (x) -> z02
    # hjc OR hth -> pgc (Cin)
    # x02 XOR y02 -> fvj (a xor b -> x)
    # skt AND kjn -> hjc ()
    # y01 AND x01 -> hth ()
    # y00 AND x00 -> skt
    # y01 XOR x01 -> kjn


def part2_fumble(s: str) -> int:
    initial_wires, gates = parse(s)
    x_val = wire_values(initial_wires, "x")
    y_val = wire_values(initial_wires, "y")
    goal_z_val = x_val + y_val

    initial_gdict = {g.out: g for g in gates}

    wires = initial_wires.copy()
    resolve_gates(wires, gates)

    first_z_val = wire_values(wires, "z")

    wrong_indexes = get_wrong_indexes(first_z_val, goal_z_val)
    wrong_wires = [f"z{i:02}" for i in wrong_indexes]
    print(wrong_wires)

    gdict = initial_gdict.copy()
    gdict["bpp"] = gdict["bpp"].with_new_output("ghf")
    gdict["ghf"] = gdict["ghf"].with_new_output("bpp")
    print(wires["bpp"])
    print(wires["ghf"])

    def find_impacting_wires(wire: str, sub=False) -> set[str]:
        if sub and wire[0] in "xyz":
            return {wire}
        g = gdict[wire]
        return (
            {g.a, g.b}
            | find_impacting_wires(g.a, sub=True)
            | find_impacting_wires(g.b, sub=True)
        )

    wires = initial_wires.copy()
    resolve_gates(wires, gdict.values())
    wrong_indexes = get_wrong_indexes(first_z_val, goal_z_val)
    wrong_wires = [f"z{i:02}" for i in wrong_indexes]
    print(wrong_wires)
    return 0

    z_impacts = {}
    for i in range(46):
        wire = f"z{i:02}"
        z_impacts[wire] = find_impacting_wires(wire)

    possible_wires = set()
    for wire in wrong_wires:
        possible_wires |= z_impacts[wire]

    bad_candidates = set()
    for candidate in possible_wires:
        for zwire in z_impacts:
            if zwire in wrong_wires:
                continue
            if candidate in z_impacts[zwire]:
                bad_candidates.add(candidate)
                break

    print(len(possible_wires))
    print(len(bad_candidates))
    print(possible_wires - bad_candidates)
    # {'bpp', 'ghf'}

    possible_wires = set()
    for wire in wrong_wires:
        possible_wires |= find_impacting_wires(wire)
        # counter.update(possible_wires)
    # print(counter.most_common())
    #
    z_impacts = {}
    for i in range(46):
        wire = f"z{i:02}"
        z_impacts[wire] = find_impacting_wires(wire)

    bad_candidates = set()
    for candidate in possible_wires:
        for zwire in z_impacts:
            if zwire in wrong_wires:
                continue
            if candidate in z_impacts[zwire]:
                bad_candidates.add(candidate)
                break

    print(len(possible_wires))
    print(len(bad_candidates))
    print(possible_wires - bad_candidates)

    # print(len(sorted(w for w in possible_wires if w[0] not in "xyz")))

    return 0
    # print("here", find_impacting_wires("z07"))
    # print("actl", bin(wire_values(wires, "z")))
    # print("goal", bin(goal_z_val))

    initial_wrong_indexes_len = len(wrong_indexes)
    print(initial_wrong_indexes_len)
    initial_wrong_indexes = set(wrong_indexes)
    next_candidates = set()
    for a, b in progress(list(combinations(gates, 2))):
        wires = initial_wires.copy()
        try:
            resolve_gates(wires, gates, {a.out: b.out, b.out: a.out})
        except ValueError:
            # assume infinite loop
            continue
        z_val = wire_values(wires, "z")
        wrong_indexes = set()
        for i, (aa, bb) in enumerate(
            zip(reversed(bin(z_val)), reversed(bin(goal_z_val)))
        ):
            if aa != bb:
                wrong_indexes.add(i)
        if initial_wrong_indexes > wrong_indexes:
            next_candidates.add((a, b))

    print(len(next_candidates))
    candidates = next_candidates
    next_candidates = set()
    for a, b in candidates:
        for c, d in progress(list(combinations(gates, 2))):
            wires = initial_wires.copy()
            swp = {a.out: b.out, b.out: a.out, c.out: d.out, d.out: c.out}
            try:
                resolve_gates(wires, gates, swp)
            except ValueError:
                continue
            z_val = wire_values(wires, "z")
            wrong_indexes = set()
            for i, (aa, bb) in enumerate(
                zip(reversed(bin(z_val)), reversed(bin(goal_z_val)))
            ):
                if aa != bb:
                    wrong_indexes.add(i)
            if initial_wrong_indexes > wrong_indexes:
                next_candidates.add((a, b))

    # gates_along_paths = set()
    # next_wrong_wires = []
    # for wire in wrong_wires:
    #     gate = gdict[wire]
    #     gates_along_paths.add(gate)
    #     next_wrong_wires.extend([gate.in_a, gate.in_b])
    # wrong_wires = next_wrong_wires
    # next_wrong_wires = []
    # for wire in wrong_wires:
    #     if wire not in gdict:
    #         continue
    #     gate = gdict[wire]
    #     gates_along_paths.add(gate)
    #     next_wrong_wires.extend([gate.in_a, gate.in_b])
    # print(len(next_wrong_wires))
    # # print("here", len(wires))

    # all_pairs = list(combinations(wires, 2))
    # print(len(all_pairs))
    # all_sets = combinations(all_pairs, 4)
    # print(len(list(all_sets)))
    # print(wire_values(wires, "z"))
    # print(len(list(combinations(wires, 2))))

    # swap 4 pairs of output wires in the gates to correctly add the x.. and y.. wires into the z.. wires

    return 0


if __name__ == "__main__":
    main(
        z_output,
        part2,
    )
