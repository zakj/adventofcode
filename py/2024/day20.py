from aoc import main
from coords import Grid, Point, mdist, neighbors
from graph import GridGraph
from graph_dyn import (
    DiGraph,
    Goal,
    all_shortest_path_lengths,
    all_shortest_paths,
    shortest_path,
    shortest_path_length,
)
from util import sliding_window


def parse(s: str):
    pass


# TODO grid.find
class Racetrack(DiGraph):
    def __init__(self, s: str):
        self.grid = Grid(s)
        self.start = self.grid.findall("S")[0]
        self.end = self.grid.findall("E")[0]

    def __iter__(self):
        return iter(self.grid.data)

    def __getitem__(self, node: Point) -> set[Point]:
        return {
            n
            for n in neighbors(node)
            if n in self.grid and self.grid.get(n, "#") != "#"
        }


class RacetrackCheats(DiGraph):
    def __init__(self, s: str):
        self.grid = Grid(s)
        self.start = self.grid.findall("S")[0]
        self.end = self.grid.findall("E")[0]

    def __iter__(self):
        return iter(self.grid.data)

    def __getitem__(self, node: Point) -> set[Point]:
        return {n for n in neighbors(node) if n in self.grid}


# type CheatNode = tuple[Point, tuple[Point | None, Point | None]]


# class RacetrackCheats(DiGraph):
#     def __init__(self, s: str):
#         self.grid = Grid(s)
#         self.start = self.grid.findall("S")[0]
#         self.end = self.grid.findall("E")[0]
#         # self.goal = Goal[CheatNode](lambda n: n[0] == self.end)

#     def __getitem__(self, node: CheatNode) -> set[CheatNode]:
#         point, cheats = node
#         ns = {n for n in neighbors(point) if n in self.grid}
#         rv = set()
#         if cheats[0] is None:
#             for n in ns:
#                 if self.grid[n] == "#":
#                     rv.add((n, (n, None)))
#                 else:
#                     rv.add((n, cheats))
#         elif cheats[1] is None:
#             for n in ns:
#                 if self.grid[n] != "#":
#                     rv.add((n, (cheats[0], n)))
#         else:
#             for n in ns:
#                 if self.grid[n] != "#":
#                     rv.add((n, cheats))
#         return rv


def cheat_neighbors(p: Point) -> list[Point]:
    x, y = p
    return [
        (x + 2, y),
        (x - 2, y),
        (x, y + 2),
        (x, y - 2),
        (x + 1, y + 1),
        (x + 1, y - 1),
        (x - 1, y + 1),
        (x - 1, y - 1),
    ]


def part1(s: str) -> int:
    G = Racetrack(s)
    # no_cheat_fastest = shortest_path_length(G, G.start, G.end)
    # fastest = shortest_path(G, G.start, G.end)
    # for p in fastest:
    #     G.grid[p] = "[bold]O"
    # G.grid.display()
    # return 0
    # print(f"{no_cheat_fastest=}")
    path = shortest_path(G, G.start, G.end)
    # for each item in path, check two hops away and see if I can get there faster
    pathset = set(path)
    cheats = 0
    for i, cur in enumerate(path):
        for n in cheat_neighbors(cur):
            if n in pathset:
                j = path.index(n)
                if j - i > 100:
                    cheats += 1
    return cheats

    # H = RacetrackCheats(s)
    # # x = _dijkstra(H, H.start, G.end, G.weight, no_cheat_fastest - 100, with_path=True)
    # x = walk(H, no_cheat_fastest - 64)
    # print(len(x))
    # print(x)
    # return 0


def cheat_neighbors2(G: Racetrack, p: Point) -> list[Point]:
    x, y = p
    rv = []
    for dy in range(-20, 21):
        for dx in range(-20, 21):
            np = (x + dx, y + dy)
            if mdist(p, np) > 20:
                continue
            if np == p:
                continue
            if G.grid.get(np, "#") == "#":
                continue
            rv.append(np)
    return rv


def part2(s: str) -> int:
    G = Racetrack(s)
    H = RacetrackCheats(s)
    path = shortest_path(G, G.start, G.end)
    pathset = set(path)
    cheats = 0
    rvset = set()
    save_at_least = 100
    distance = shortest_path_length(G, G.end)
    for cur in path:
        for np in cheat_neighbors2(G, cur):
            cheat_value = distance[cur] - (distance[np] + mdist(cur, np))
            if cheat_value >= save_at_least:
                cheats += 1
    # 872420 too low
    # 2404026 too high
    # 994807 ?
    return cheats

    #     for n in path[i + 1 :]:
    #         if mdist(cur, n) < 19:
    #             j = path.index(n)
    #             spths = all_shortest_paths(H, cur, n)
    #             sp = None
    #             for ssp in spths:
    #                 if H.grid[ssp[1]] == H.grid[ssp[-2]] == "#":
    #                     sp = ssp
    #                     break
    #             if sp is None:
    #                 continue
    #             prev_dist = j - i
    #             cur_dist = len(sp) - 1
    #             # if (cur) == (1, 3) and n == (3, 8):
    #             #     print("checking")
    #             #     print(f"{prev_dist - cur_dist=}")
    #             #     print(f"{cur_dist=}")
    #             if (
    #                 sp
    #                 and H.grid[sp[1]] == "#"
    #                 and H.grid[sp[-2]] == "#"
    #                 and prev_dist - cur_dist >= save_at_least
    #             ):
    #                 # if (cur) == (1, 3) and n == (3, 8):
    #                 #     print("** got it")
    #                 # if (cur) == (1, 3):
    #                 #     print(cur, i, n, j, len(sp), shortest_path(H, cur, n))
    #                 rvset.add((cur, n))
    # # print(rvset)
    # return len(rvset)


# 2404026 too high
if __name__ == "__main__":
    main(
        part1,
        part2,
    )
