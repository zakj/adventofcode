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

DIR_VALUES = {
    (1, 0): 0,
    (0, 1): 1,
    (-1, 0): 2,
    (0, -1): 3,
}


def vec(*xs: int) -> npt.NDArray[np.int8]:
    return np.array(xs)


def parse(s: str):
    *grid, _, path_str = s.splitlines()
    path = re.findall(r"\d+|[RL]", path_str)
    return grid, path


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

    def distance(self, other: "Face") -> int:
        if not isinstance(other, Face):
            raise NotImplementedError
        return mdist(self.origin, other.origin) // self.size

    def delta_to(self, other: "Face") -> np.ndarray:
        if not isinstance(other, Face):
            raise NotImplementedError
        return vec(other.x, other.y) - vec(self.x, self.y)

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

    def points_3d(self) -> dict[Point3, bool]:
        points: dict[Point3, bool] = {}
        for y, line in enumerate(self.grid):
            for x, c in enumerate(line):
                points[self.uv_xyz(x, y)] = c == "."
        return points


def find_faces(grid: list[str]):
    size = gcd(len(grid), max(len(line) for line in grid))
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


def build_cube(faces: list[Face]):
    # return {p: walkable for face in faces for p, walkable in face.transform().items()}
    cube: dict[Point3, bool] = {}
    # TODO: this is ugly
    point_face: dict[Point3, Face] = {}
    for face in faces:
        points = face.points_3d()
        for p, clear in points.items():
            cube[p] = clear
            point_face[p] = face

    return cube, point_face


def cube_walk(grid: list[str], path: list[str]) -> int:
    faces = find_faces(grid)
    walkable, point_face = build_cube(faces)

    pos = (0, 0, -1)
    dir = vec(1, 0, 0)
    for step in path:
        if step.isnumeric():
            for _ in range(int(step)):
                next_pos = cast(Point3, tuple(pos + dir))

                if next_pos not in walkable:
                    next_pos = cast(Point3, tuple(next_pos - point_face[pos].normal))
                    if not walkable[next_pos]:
                        break
                    dir = point_face[pos].normal * -1
                    pos = next_pos
                elif walkable[next_pos]:
                    pos = next_pos
                else:
                    break
        elif step == "R":
            dir = np.cross(dir, point_face[pos].normal)
        elif step == "L":
            dir = np.cross(point_face[pos].normal, dir)

    # XXX removing this breaks the example?!?
    print(f"{point_face[pos].normalize(pos)=}")

    face = point_face[pos]
    x, y = face.normalize(pos)
    dir_value = DIR_VALUES[dir.dot(face.u_dir), dir.dot(face.v_dir)]

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
