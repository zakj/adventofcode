import re
from dataclasses import dataclass
from itertools import repeat
from math import gcd
from operator import add, mul, sub
from typing import cast

from aoc import main
from aoc.coords import (
    Dir,
    Grid,
    Point,
    Point3,
    Vector,
    addp,
    mdist,
    subp,
    turn_left,
    turn_right,
)

DIR_VALUES = {
    Dir.E: 0,
    Dir.S: 1,
    Dir.W: 2,
    Dir.N: 3,
}


def parse(s: str) -> tuple[list[str], list[str]]:
    *grid, _, path_str = s.splitlines()
    path = re.findall(r"\d+|[RL]", path_str)
    return grid, path


def wrap2d(full_map: set[Point], p: Point, dir: Vector) -> Point | None:
    while (check := subp(p, dir)) in full_map:
        p = check
    return p


def map_walk(map_rows: list[str], path: list[str]) -> int:
    grid = Grid("\n".join(map_rows))
    walls = set(grid.findall("#"))
    floors = set(grid.findall("."))
    all_tiles = walls | floors

    pos = map_rows[0].index("."), 0
    facing = Dir.E
    for step in path:
        if step == "L":
            facing = turn_left(facing)
        elif step == "R":
            facing = turn_right(facing)
        else:
            for _ in range(int(step)):
                next_pos = addp(pos, facing)
                if next_pos not in all_tiles:
                    next_pos = wrap2d(all_tiles, next_pos, facing)
                if next_pos in floors:
                    pos = next_pos
                else:
                    break

    return (pos[1] + 1) * 1000 + (pos[0] + 1) * 4 + DIR_VALUES[facing]


def cross3(a: Point3, b: Point3) -> Point3:
    return (
        a[1] * b[2] - a[2] * b[1],
        a[2] * b[0] - a[0] * b[2],
        a[0] * b[1] - a[1] * b[0],
    )


def dot3(a: Point3, b: Point3) -> int:
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]


def vadd[T: tuple[int, ...]](a: T, b: T) -> T:
    return cast(T, tuple(map(add, a, b)))


def vmul[T: tuple[int, ...]](a: T, b: T) -> T:
    return cast(T, tuple(map(mul, a, b)))


def vsub[T: tuple[int, ...]](a: T, b: T) -> T:
    return cast(T, tuple(map(sub, a, b)))


def vinvert[T: tuple[int, ...]](a: T) -> T:
    return cast(T, tuple(map(mul, a, repeat(-1))))


def turn_right_around(dir: Point3, axis: Point3) -> Point3:
    return cross3(dir, axis)


def turn_left_around(dir: Point3, axis: Point3) -> Point3:
    return cross3(axis, dir)


@dataclass
class CubeData:
    xy: Point
    walkable: bool
    u_dir: Point3
    v_dir: Point3
    normal: Point3


@dataclass
class Face:
    origin: Point
    grid: list[str]
    u_dir: Point3 = (0, 0, 0)
    v_dir: Point3 = (0, 0, 0)
    normal: Point3 = (0, 0, 0)

    def __hash__(self):
        return hash(self.origin)

    @property
    def size(self):
        return len(self.grid)  # assumes square faces

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

    def delta_to(self, other: "Face") -> Point:
        if not isinstance(other, Face):
            raise NotImplementedError
        return vsub((other.x, other.y), (self.x, self.y))

    def uv_xyz(self, u: int, v: int) -> Point3:
        # TODO this can probably be cleaner
        n = {-1: 1, 1: self.size}[sum(self.normal)]
        u_dir = vmul(self.u_dir, (u, u, u))
        v_dir = vmul(self.v_dir, (v, v, v))
        normal = vmul(self.normal, (n, n, n))
        projected = vadd(vadd(u_dir, v_dir), normal)
        offset = tuple(
            self.size - 1 if self.u_dir[i] < 0 or self.v_dir[i] < 0 else 0
            for i in range(3)
        )
        return vadd(projected, cast(Point3, offset))

    def xyz_uv(self, x: int, y: int, z: int) -> Point:
        xyz = (x, y, z)
        offset = tuple(
            self.size - 1 if self.u_dir[i] < 0 or self.v_dir[i] < 0 else 0
            for i in range(3)
        )
        xyz = vsub(xyz, cast(Point3, offset))
        return (dot3(self.u_dir, xyz), dot3(self.v_dir, xyz))

    def points_3d(self) -> dict[Point3, CubeData]:
        points: dict[Point3, CubeData] = {}
        for y, line in enumerate(self.grid):
            for x, c in enumerate(line):
                points[self.uv_xyz(x, y)] = CubeData(
                    xy=vadd(self.origin, (x, y)),
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
    front.u_dir = (1, 0, 0)
    front.v_dir = (0, 1, 0)
    front.normal = (0, 0, -1)

    # walk neighbors to find vectors
    q = [front]
    while q:
        face = q.pop()

        # https://en.wikipedia.org/wiki/Cube_mapping
        for neighbor in adj[face]:
            if any(neighbor.normal):
                continue
            match tuple(face.delta_to(neighbor)):
                case (0, -1):  # up
                    neighbor.u_dir = face.u_dir
                    neighbor.v_dir = face.normal
                    neighbor.normal = vinvert(face.v_dir)
                case (1, 0):  # right
                    neighbor.u_dir = vinvert(face.normal)
                    neighbor.v_dir = face.v_dir
                    neighbor.normal = face.u_dir
                case (0, 1):  # down
                    neighbor.u_dir = face.u_dir
                    neighbor.v_dir = vinvert(face.normal)
                    neighbor.normal = face.v_dir
                case (-1, 0):  # left
                    neighbor.u_dir = face.normal
                    neighbor.v_dir = face.v_dir
                    neighbor.normal = vinvert(face.u_dir)
            q.append(neighbor)

    return faces


def cube_walk(grid: list[str], path: list[str]) -> int:
    faces = find_faces(grid)
    cube: dict[Point3, CubeData] = {}
    for face in faces:
        cube.update(face.points_3d())

    pos: Point3 = (0, 0, -1)
    dir: Point3 = (1, 0, 0)
    for step in path:
        if step.isnumeric():
            for _ in range(int(step)):
                next_pos = vadd(pos, dir)

                if next_pos not in cube:
                    next_pos = vsub(next_pos, cube[pos].normal)
                    if not cube[next_pos].walkable:
                        break
                    dir = vinvert(cube[pos].normal)
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
    dir_value = DIR_VALUES[dot3(dir, data.u_dir), dot3(dir, data.v_dir)]

    return 1000 * (y + 1) + 4 * (x + 1) + dir_value


if __name__ == "__main__":
    main(
        lambda s: map_walk(*parse(s)),
        lambda s: cube_walk(*parse(s)),
    )
