import re
from collections import deque
from dataclasses import dataclass, field
from functools import cached_property
from math import gcd
from pprint import pprint
from typing import cast

import numpy as np
import numpy.typing as npt
from aoc import solve
from coords import Point, mdist

Point3 = tuple[int, int, int]


def vec(*xs: int) -> npt.NDArray[np.int8]:
    return np.array(xs)


@dataclass()
class Face:
    origin: Point
    grid: list[str]
    u_dir: np.ndarray = field(default_factory=lambda: vec(0, 0, 0))
    v_dir: np.ndarray = field(default_factory=lambda: vec(0, 0, 0))
    normal: np.ndarray = field(default_factory=lambda: vec(0, 0, 0))

    def __hash__(self):
        return hash(self.origin)

    @property
    def size(self):
        return len(self.grid)  # assumes square faces

    # TODO: maybe unused
    @property
    def x(self):
        return self.origin[0] // self.size

    @property
    def y(self):
        return self.origin[1] // self.size

    # TODO: only used for debugging
    def __lt__(self, other):
        return (self.y, self.x) < (other.y, other.x)

    def distance(self, other: "Face") -> int:
        if not isinstance(other, Face):
            raise NotImplementedError
        return mdist(self.origin, other.origin) // self.size

    def delta_to(self, other: "Face") -> np.ndarray:
        if not isinstance(other, Face):
            raise NotImplementedError
        return vec(other.x, other.y) - vec(self.x, self.y)

    @cached_property
    def z(self):
        return 1 if any(self.normal < 0) else self.size

    def uv_xyz(self, u: int, v: int) -> Point3:
        normal_map = {-1: 1, 1: self.size}
        projected = (
            self.u_dir.dot(u)
            + self.v_dir.dot(v)
            + self.normal.dot(normal_map[self.normal.sum()])
        )
        np.add(
            projected,
            self.size - 1,
            where=(self.u_dir < 0) | (self.v_dir < 0),
            out=projected,
        )
        return cast(Point3, tuple(projected))

    def xyz_uv(self, x: int, y: int, z: int) -> Point:
        xyz = np.subtract(
            (x, y, z), self.size - 1, where=(self.u_dir < 0) | (self.v_dir < 0)
        )
        return tuple([self.u_dir.dot(xyz), self.v_dir.dot(xyz)])

    def normalize(self, point: Point3) -> Point:
        point2 = self.xyz_uv(*point)
        return tuple(np.array(self.origin) + point2)

    def transform(self) -> dict[Point3, bool]:
        points: dict[Point3, bool] = {}
        for y, line in enumerate(self.grid):
            for x, c in enumerate(line):
                points[self.uv_xyz(x, y)] = c == "."
        return points


def parse(s: str):
    *grid, _, path_str = s.splitlines()
    path = re.findall(r"\d+|[RL]", path_str)
    return grid, path


def find_face_size(grid: list[str]) -> int:
    return gcd(len(grid), max(len(line) for line in grid))
    # TODO lol this was overcomplicated
    # # NOTE: Assumes at least one edge has only one face. I think that's safe.
    # g = [tuple(c for c in line) for line in grid]
    # side_lengths = []
    # for _ in range(4):
    #     side_lengths.append(len([c for c in g[0] if c != " "]))
    #     g = list(zip(*g))[::-1]  # rotate counter-clockwise
    # return min(side_lengths)


# XXX debug
def v_to_str(v: np.ndarray | None) -> str:
    if v is None:
        return "NONE"
    match v.tolist():
        case [x, 0, 0]:
            return f"{'+' if x > 0 else '-'}x"
        case [0, x, 0]:
            return f"{'+' if x > 0 else '-'}y"
        case [0, 0, x]:
            return f"{'+' if x > 0 else '-'}z"
    return "no match"


def vs(f: Face) -> str:
    return " ".join(v_to_str(v) for v in [f.u_dir, f.v_dir, f.normal])


def find_faces(grid: list[str]):
    size = find_face_size(grid)
    height = len(grid)
    width = max(len(row) for row in grid)  # account for missing trailing space
    faces: list[Face] = []
    # TODO: cleaner to just drop this to a tiny grid of face size 1 for doing the walk?
    for y in range(0, height, size):
        for x in range(0, width, size):
            subgrid = [line[x : x + size] for line in grid[y : y + size]]
            if not all("." in line for line in subgrid):
                continue
            faces.append(Face(origin=(x, y), grid=subgrid))
    assert len(faces) == 6

    front = faces[0]
    front.u_dir = vec(1, 0, 0)
    front.v_dir = vec(0, 1, 0)
    front.normal = vec(0, 0, -1)

    # now I have 2d faces with their top-left origin

    # build adjacency grid
    adj: dict[Face, list[Face]] = {}
    for f in faces:
        adj[f] = [g for g in faces if f.distance(g) == 1]

    # walk neighbors to find vectors
    q = deque([front])
    while q:
        face = q.pop()

        # https://en.wikipedia.org/wiki/Cube_mapping
        for neighbor in adj[face]:
            if any(neighbor.normal.nonzero()):
                continue
            match tuple(face.delta_to(neighbor)):
                case (0, -1):  # up
                    print(f"{face.origin=} up to {neighbor.origin=}")
                    neighbor.u_dir = face.u_dir
                    neighbor.v_dir = face.normal
                    neighbor.normal = -face.v_dir
                case (1, 0):  # right
                    print(f"{face.origin=} right to {neighbor.origin=}")
                    neighbor.u_dir = -face.normal
                    neighbor.v_dir = face.v_dir
                    neighbor.normal = face.u_dir
                case (0, 1):  # down
                    print(f"{face.origin=} down to {neighbor.origin=}")
                    neighbor.u_dir = face.u_dir
                    neighbor.v_dir = -face.normal
                    neighbor.normal = face.v_dir
                case (-1, 0):  # left
                    print(f"{face.origin=} left to {neighbor.origin=}")
                    neighbor.u_dir = face.normal
                    neighbor.v_dir = face.v_dir
                    neighbor.normal = -face.u_dir
            q.append(neighbor)

    return faces


def build_cube(faces: list[Face]):
    # return {p: walkable for face in faces for p, walkable in face.transform().items()}
    cube: dict[Point3, bool] = {}
    point_face: dict[Point3, Face] = {}
    dupes = []
    for face in faces:
        points = face.transform()
        for p, clear in points.items():
            if p == (0, 4, 0):
                ...
                # print(f"{p=} {face=}")
            if p in cube:
                dupes.append((p, face))
                # print(f"  DUPE {p=} {face.origin=}")
            cube[p] = clear
            point_face[p] = face

    # front = next(f for f in faces if f.origin == (8, 0))
    # back = next(f for f in faces if f.origin == (8, 8))
    # left = next(f for f in faces if f.origin == (4, 4))
    # right = next(f for f in faces if f.origin == (12, 8))
    # top = next(f for f in faces if f.origin == (0, 4))
    # bottom = next(f for f in faces if f.origin == (8, 4))

    # frp = set()
    # bap = set()
    # lep = set()
    # rip = set()
    # topp = set()
    # botp = set()
    # for y in range(4):
    #     for x in range(4):
    #         frp.add((x, y, -1))
    #         bap.add((x, y, 4))
    #         lep.add((-1, x, y))
    #         rip.add((4, x, y))
    #         topp.add((x, -1, y))
    #         botp.add((x, 4, y))
    # assert set(list(front.transform().keys())) == frp
    # assert set(list(back.transform().keys())) == bap
    # assert set(list(left.transform().keys())) == lep
    # assert set(list(right.transform().keys())) == rip
    # assert set(list(top.transform().keys())) == topp
    # assert set(list(bottom.transform().keys())) == botp

    return cube, point_face


def cube_walk(grid: list[str], path: list[str]) -> int:
    faces = find_faces(grid)
    walkable, point_face = build_cube(faces)
    # print(f"{len(cube)=}")
    # print(f"{cube=}")
    print("========================================")

    pos = (0, 0, -1)
    dir = vec(1, 0, 0)
    loc = lambda: point_face[pos].normalize(pos)
    for step in path:
        print(f"-- {step=} --")

        if step.isnumeric():
            for _ in range(int(step)):
                next_pos = cast(Point3, tuple(pos + dir))
                # print(f"  {next_pos=}")

                if loc() == (10, 5):
                    print(" ", pos, next_pos, dir)

                if next_pos not in walkable:
                    next_pos = cast(Point3, tuple(next_pos - point_face[pos].normal))
                    assert next_pos in walkable
                    if not walkable[next_pos]:
                        break
                    # XXX we don't check for wall here!!
                    dir = point_face[pos].normal * -1
                    pos = next_pos
                    loc()
                    loc()
                    print(loc())
                    print(f"--> NEW FACE {point_face[pos].origin} {pos=} {dir=}")
                elif walkable[next_pos]:
                    pos = next_pos
                    loc()
                    loc()
                    print(loc())
                    # loc(pos)
                else:
                    print("###")
                    # print(
                    #     f"  {next_pos=} {walkable[next_pos]=} {point_face[next_pos].normalize(next_pos)=}"
                    # )
                    break
        elif step == "R":
            dir = np.cross(dir, point_face[pos].normal)
            # print(f"{dir=}")
        elif step == "L":
            # print(f"{normals[pos]=} {dir=}")
            dir = np.cross(point_face[pos].normal, dir)
            # print(f"{dir=}")

    print(f"DONE {pos=} {dir=}, {point_face[pos]=}")
    print(f"{point_face[pos].xyz_uv(*pos)=}")
    print(f"{point_face[pos].normalize(pos)=}")

    face = point_face[pos]
    x, y = face.normalize(pos)
    dir_values = {
        (1, 0): 0,
        (0, 1): 1,
        (-1, 0): 2,
        (0, -1): 3,
    }
    dir_value = dir_values[dir.dot(face.u_dir), dir.dot(face.v_dir)]

    return 1000 * (y + 1) + 4 * (x + 1) + dir_value


examples = solve(lambda s: cube_walk(*parse(s)), suffix="ex", expect=(5031,))

parts = solve(
    lambda s: cube_walk(*parse(s)),
    expect=(95291,),
)
