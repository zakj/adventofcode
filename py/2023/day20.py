from collections import defaultdict, deque
from dataclasses import dataclass, field
from enum import IntEnum, auto
from itertools import count
from math import lcm

from aoc import main
from graph import Graph, shortest_path

Pulse = int
HIGH: Pulse = 1
LOW: Pulse = 0


class ModuleType(IntEnum):
    Button = auto()
    Broadcast = auto()
    FlipFlop = auto()
    Conjunction = auto()


@dataclass
class Module:
    outputs: list[str] = field(default_factory=lambda: [])
    is_default = True


@dataclass
class FlipFlop(Module):
    is_on: bool = False

    @property
    def is_default(self):
        return not self.is_on


@dataclass
class Conjuction(Module):
    memory: dict[str, Pulse] = field(default_factory=lambda: {})

    @property
    def is_default(self):
        return all(v == LOW for v in self.memory.values())


def parse(s: str) -> dict[str, Module]:
    modules = {"button": Module(outputs=["broadcaster"])}
    for line in s.splitlines():
        name, outputs = line.split(" -> ")
        outputs = outputs.split(", ")
        if name == "broadcaster":
            modules[name] = Module(outputs=outputs)
            continue
        type = name[0]
        name = name[1:]
        if type == "%":
            modules[name] = FlipFlop(outputs=outputs)
        if type == "&":
            modules[name] = Conjuction(outputs=outputs)

    for name, mod in modules.items():
        for output in mod.outputs:
            omod = modules.get(output)
            if isinstance(omod, Conjuction):
                omod.memory[name] = LOW

    return modules


def press_button(modules: dict[str, Module]) -> tuple[int, int]:
    queue: deque[tuple[int, str]] = deque([(LOW, "button")])
    sent = {LOW: 0, HIGH: 0}
    while queue:
        pulse, sender = queue.popleft()
        for name in modules[sender].outputs:
            sent[pulse] += 1
            mod = modules.get(name)
            match mod:
                case FlipFlop():
                    if pulse == LOW:
                        queue.append((LOW if mod.is_on else HIGH, name))
                        mod.is_on = not mod.is_on
                case Conjuction():
                    mod.memory[sender] = pulse
                    all_high = all(pulse == HIGH for pulse in mod.memory.values())
                    queue.append((LOW if all_high else HIGH, name))
                case Module():
                    queue.append((pulse, name))
    return sent[LOW], sent[HIGH]


def total_pulses(s: str) -> int:
    modules = parse(s)
    presses = 1
    low, high = press_button(modules)
    while not all(m.is_default for m in modules.values()) and presses < 1000:
        nl, nh = press_button(modules)
        low += nl
        high += nh
        presses += 1
    return (1000 // presses * low) * (1000 // presses * high)


def find_cycles_in(modules: dict[str, Module], search: list[str]) -> dict[str, int]:
    cycles = {}
    for i in count(1):
        queue: deque[tuple[int, str]] = deque([(LOW, "broadcaster")])
        while queue:
            pulse, sender = queue.popleft()
            for name in modules[sender].outputs:
                mod = modules.get(name)
                match mod:
                    case FlipFlop():
                        if pulse == LOW:
                            queue.append((LOW if mod.is_on else HIGH, name))
                            mod.is_on = not mod.is_on
                    case Conjuction():
                        mod.memory[sender] = pulse
                        all_high = all(pulse == HIGH for pulse in mod.memory.values())
                        queue.append((LOW if all_high else HIGH, name))
                        if not all_high and name in search and name not in cycles:
                            cycles[name] = i
                            if len(cycles) == len(search):
                                return cycles
                    case Module():
                        queue.append((pulse, name))
    raise ValueError


def presses_to_low_rx(s: str) -> int:
    if len(s) < 500:
        # TODO: skip examples
        return -1
    modules = parse(s)

    G = Graph()
    for name, mod in modules.items():
        for target in mod.outputs:
            G.add_edge(name, target)

    paths = (
        reversed(shortest_path(G, start, "rx"))
        for start in G.edges["broadcaster"].keys()
    )
    search = next(items for items in zip(*paths) if len(set(items)) > 1)

    return lcm(*find_cycles_in(modules, search).values())


if __name__ == "__main__":
    main(total_pulses, presses_to_low_rx)
