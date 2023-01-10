import re
from dataclasses import dataclass, field
from math import gcd
from typing import NamedTuple, cast

import numpy as np
from aoc import solve
from coords import (
    Dir,
    Point,
    Point3,
    Vector,
    mdist,
    turn_left_around,
    turn_right_around,
)

DIR_VALUES = {
    Dir.E.value: 0,
    Dir.S.value: 1,
    Dir.W.value: 2,
    Dir.N.value: 3,
}


def vec(*xs: int) -> Vector:
    return np.array(xs)


def parse(s: str):
    *grid, _, path_str = s.splitlines()
    path = re.findall(r"\d+|[RL]", path_str)
    return grid, path


class CubeData(NamedTuple):
    xy: Point
    walkable: bool
    u_dir: Vector
    v_dir: Vector
    normal: Vector


@dataclass()
class Face:
    origin: Point
    grid: list[str]
    u_dir: Vector = field(default_factory=lambda: vec(0, 0, 0))
    v_dir: Vector = field(default_factory=lambda: vec(0, 0, 0))
    normal: Vector = field(default_factory=lambda: vec(0, 0, 0))

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

    def distance(self, other: "Face") -> int:
        if not isinstance(other, Face):
            raise NotImplementedError
        return mdist(self.origin, other.origin) // self.size

    def delta_to(self, other: "Face") -> Vector:
        if not isinstance(other, Face):
            raise NotImplementedError
        return vec(other.x, other.y) - vec(self.x, self.y)

    def uv_xyz(self, u: int, v: int) -> Point3:
        n = {-1: 1, 1: self.size}[self.normal.sum()]
        projected = self.u_dir.dot(u) + self.v_dir.dot(v) + self.normal.dot(n)
        np.add(
            projected,
            self.size - 1,
            where=(self.u_dir < 0) | (self.v_dir < 0),
            out=projected,
        )
        return tuple(projected)

    def xyz_uv(self, x: int, y: int, z: int) -> Point:
        xyz = np.array([x, y, z])
        mapping = (self.u_dir < 0) | (self.v_dir < 0)
        np.subtract(xyz, self.size - 1, out=xyz, where=mapping)
        return tuple([self.u_dir.dot(xyz), self.v_dir.dot(xyz)])

    def normalize(self, point: Point3) -> Point:
        point2 = self.xyz_uv(*point)
        return tuple(np.array(self.origin) + point2)

    def points_3d(self) -> dict[Point3, CubeData]:
        points: dict[Point3, CubeData] = {}
        for y, line in enumerate(self.grid):
            for x, c in enumerate(line):
                points[self.uv_xyz(x, y)] = CubeData(
                    xy=tuple(np.array(self.origin) + (x, y)),
                    walkable=c == ".",
                    u_dir=self.u_dir,
                    v_dir=self.v_dir,
                    normal=self.normal,
                )
        return points


def find_faces(grid: list[str]):
    size = gcd(len(grid), max(len(line) for line in grid))
    height = len(grid)
    width = max(len(row) for row in grid)  # account for missing trailing space
    faces: list[Face] = []
    # TODO: cleaner to just drop this to a tiny grid of face size 1 for doing the walk?
    # get 2d faces with their top-left origin
    for y in range(0, height, size):
        for x in range(0, width, size):
            subgrid = [line[x : x + size] for line in grid[y : y + size]]
            if not all("." in line for line in subgrid):
                continue
            faces.append(Face(origin=(x, y), grid=subgrid))

    # build adjacency grid
    adj: dict[Face, list[Face]] = {}
    for f in faces:
        adj[f] = [g for g in faces if f.distance(g) == 1]

    front = faces[0]
    front.u_dir = vec(1, 0, 0)
    front.v_dir = vec(0, 1, 0)
    front.normal = vec(0, 0, -1)

    # walk neighbors to find vectors
    q = [front]
    while q:
        face = q.pop()

        # https://en.wikipedia.org/wiki/Cube_mapping
        for neighbor in adj[face]:
            if any(neighbor.normal.nonzero()):
                continue
            match tuple(face.delta_to(neighbor)):
                case (0, -1):  # up
                    neighbor.u_dir = face.u_dir
                    neighbor.v_dir = face.normal
                    neighbor.normal = -face.v_dir
                case (1, 0):  # right
                    neighbor.u_dir = -face.normal
                    neighbor.v_dir = face.v_dir
                    neighbor.normal = face.u_dir
                case (0, 1):  # down
                    neighbor.u_dir = face.u_dir
                    neighbor.v_dir = -face.normal
                    neighbor.normal = face.v_dir
                case (-1, 0):  # left
                    neighbor.u_dir = face.normal
                    neighbor.v_dir = face.v_dir
                    neighbor.normal = -face.u_dir
            q.append(neighbor)

    return faces


def cube_walk(grid: list[str], path: list[str]) -> int:
    faces = find_faces(grid)
    cube: dict[Point3, CubeData] = {}
    for face in faces:
        cube.update(face.points_3d())

    pos: Point3 = (0, 0, -1)
    dir: Vector = vec(1, 0, 0)
    for step in path:
        if step.isnumeric():
            for _ in range(int(step)):
                next_pos = cast(Point3, tuple(pos + dir))

                if next_pos not in cube:
                    next_pos = cast(Point3, tuple(next_pos - cube[pos].normal))
                    if not cube[next_pos].walkable:
                        break
                    dir = cube[pos].normal * -1
                    pos = next_pos
                elif cube[next_pos].walkable:
                    pos = next_pos
                else:
                    break
        elif step == "R":
            dir = turn_right_around(dir, cube[pos].normal)
        elif step == "L":
            dir = turn_left_around(dir, cube[pos].normal)

    data = cube[pos]
    x, y = data.xy
    dir_value = DIR_VALUES[dir.dot(data.u_dir), dir.dot(data.v_dir)]

    return 1000 * (y + 1) + 4 * (x + 1) + dir_value


examples = solve(
    lambda s: cube_walk(*parse(s)),
    expect=(5031,),
    suffix="ex",
)

parts = solve(
    lambda s: cube_walk(*parse(s)),
    expect=(95291,),
)
