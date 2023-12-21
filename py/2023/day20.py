from collections import defaultdict, deque
from dataclasses import dataclass, field
from enum import IntEnum, auto

from aoc import main

HIGH = 1
LOW = 0


class ModuleType(IntEnum):
    Button = auto()
    Broadcast = auto()
    FlipFlop = auto()
    Conjunction = auto()


@dataclass
class Module:
    type: ModuleType
    outputs: list[str] = field(default_factory=lambda: [])


@dataclass
class FlipFlop(Module):
    type: ModuleType = ModuleType.FlipFlop
    is_on: bool = False


@dataclass
class Conjuction(Module):
    type: ModuleType = ModuleType.Conjunction
    memory: dict[str, int] = field(default_factory=lambda: {})


def parse(s: str) -> dict[str, Module]:
    modules = {"button": Module(type=ModuleType.Button, outputs=["broadcaster"])}
    inputs = defaultdict(list)
    for line in s.splitlines():
        name, outputs = line.split(" -> ")
        outputs = outputs.split(", ")
        if name == "broadcaster":
            modules[name] = Module(type=ModuleType.Broadcast, outputs=outputs)
        else:
            type_str = name[0]
            name = name[1:]
            if type_str == "%":
                modules[name] = FlipFlop(outputs=outputs)
            if type_str == "&":
                modules[name] = Conjuction(outputs=outputs)
        for target in outputs:
            inputs[target].append(name)

    for name, mod in modules.items():
        if isinstance(mod, Conjuction):
            mod.memory = {k: LOW for k in inputs[name]}

    return modules


class RxLow(Exception):
    pass


def pulse(modules: dict[str, Module], type: int, sender: str) -> tuple[int, int]:
    queue: deque[tuple[int, str]] = deque([(type, sender)])
    sent = {LOW: 0, HIGH: 0}
    while queue:
        pulse, sender = queue.popleft()
        targets = modules[sender].outputs
        for name in targets:
            sent[pulse] += 1
            # print(f"{sender} -{'low' if pulse ==LOW else 'high'}-> {name}")
            if name == "rx":
                if pulse == LOW:
                    print(f"{sender} -{'low' if pulse ==LOW else 'high'}-> {name}")
                    raise RxLow
            if name not in modules:
                continue
            mod = modules[name]
            if mod.type == ModuleType.Broadcast:
                queue.append((pulse, name))
            elif isinstance(mod, FlipFlop):
                if pulse == LOW:
                    queue.append((LOW if mod.is_on else HIGH, name))
                    mod.is_on = not mod.is_on
            elif isinstance(mod, Conjuction):
                mod.memory[sender] = pulse
                all_high = all(pulse == HIGH for pulse in mod.memory.values())
                # print(f"  {str(mod.memory)} {all_high}")
                queue.append((LOW if all_high else HIGH, name))
            else:
                raise ValueError
    return sent[LOW], sent[HIGH]


def is_default(module: Module) -> bool:
    if module.type in [ModuleType.Button, ModuleType.Broadcast]:
        return True
    elif isinstance(module, FlipFlop):
        return not module.is_on
    elif isinstance(module, Conjuction):
        return all(v == LOW for v in module.memory.values())
    else:
        raise ValueError


def part1(s: str) -> int:
    # if len(s) > 500:
    #     return -1
    modules = parse(s)
    pushes = 1
    low, high = pulse(modules, LOW, "button")
    while pushes < 1000:
        if all(is_default(m) for m in modules.values()):
            break
        pushes += 1
        nl, nh = pulse(modules, LOW, "button")
        low += nl
        high += nh
    return (1000 // pushes * low) * (1000 // pushes * high)


from itertools import count

from graph import Graph, shortest_path


def pulse2(modules: dict[str, Module], search: list[str]) -> dict[str, int]:
    cycles = {}
    for i in count(1):
        queue: deque[tuple[int, str]] = deque([(LOW, "broadcaster")])
        while queue:
            pulse, sender = queue.popleft()
            targets = modules[sender].outputs
            for name in targets:
                # print(f"{sender} -{'low' if pulse ==LOW else 'high'}-> {name}")
                if name == "rx":
                    if pulse == LOW:
                        print(
                            f"{i} {sender} -{'low' if pulse ==LOW else 'high'}-> {name}"
                        )
                        raise RxLow
                if name not in modules:
                    continue
                mod = modules[name]
                if mod.type == ModuleType.Broadcast:
                    queue.append((pulse, name))
                elif isinstance(mod, FlipFlop):
                    if pulse == LOW:
                        queue.append((LOW if mod.is_on else HIGH, name))
                        mod.is_on = not mod.is_on
                elif isinstance(mod, Conjuction):
                    mod.memory[sender] = pulse
                    all_high = all(pulse == HIGH for pulse in mod.memory.values())
                    if not all_high and name in search and name not in cycles:
                        cycles[name] = i
                        if len(cycles) == len(search):
                            return cycles
                    # print(f"  {str(mod.memory)} {all_high}")
                    queue.append((LOW if all_high else HIGH, name))
                else:
                    raise ValueError
    raise ValueError


from math import lcm


def part2(s: str) -> int:
    if len(s) < 500:
        # skip examples TODO remove this
        return -1
    modules = parse(s)

    G = Graph()
    for name, mod in modules.items():
        for target in mod.outputs:
            G.add_edge(name, target)
    paths = []
    for start in G.edges["broadcaster"].keys():
        paths.append(shortest_path(G, start, "rx"))

    search = []
    for items in zip(*(reversed(p) for p in paths)):
        if len(set(items)) == 1:
            continue
        search = items
        break

    cycles = pulse2(modules, search)
    return lcm(*cycles.values())

    searching = "zp"
    cc = 0
    # while True:
    #     cc += 1
    #     pulse(modules, LOW, "broadcaster")
    #     if all(v == HIGH for v in modules[searching].memory.values()):
    #         print("GOT IT", cc)
    #         break

    inputs = defaultdict(list)
    for src, mod in modules.items():
        for dst in mod.outputs:
            inputs[dst].append(src)

    cur = "rx"
    while len(inputs[cur]) == 1:
        cur = inputs[cur][0]
    watch = inputs[cur]
    cycles = {}

    level = 0
    mod = "broadcaster"

    seen = set(mod)

    def pmod(name, level):
        if name in seen:
            return
        seen.add(name)
        if name in modules:
            mod = modules[name]
            print(level * "  ", name, mod.type.name, "->", ", ".join(mod.outputs))
            for oo in mod.outputs:
                pmod(oo, level + 1)
        else:
            print(level * "  ", name)

    # find path between broadcaster targets and rx feeder
    # run each of those loops to find a cycle
    # pmod("broadcaster", 0)

    # for pushes in count(1):
    #     push_button(modules)
    #     for name, value in modules[cur].memory.items():
    #         if value == HIGH and name not in cycles:
    #             print(f"found: {name=}")
    #             cycles[name] = pushes
    #     if len(cycles) == len(watch):
    #         print(f"{pushes=}")
    #         break
    return -1


if __name__ == "__main__":
    main(
        lambda s: part1(s),
        lambda s: part2(s),
    )
