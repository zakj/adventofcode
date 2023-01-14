import re
from collections import defaultdict
from dataclasses import dataclass
from typing import Final

import numpy as np
from aoc import profile, solve
from coords import Point, mdist

FREQUENCY_MULTIPLIER: Final[int] = 4000000


def parse(s: str) -> tuple[dict[Point, int], list[Point]]:
    sensors = {}
    beacons = []
    for line in s.splitlines():
        (sx, sy, bx, by) = (int(n) for n in re.findall(r"-?\d+", line))
        sensor = (sx, sy)
        beacon = (bx, by)
        sensors[sensor] = mdist(sensor, beacon)
        beacons.append(beacon)
    return sensors, beacons


@dataclass(eq=True)
class Range:
    start: int
    end: int

    @staticmethod
    def union(*ranges: "Range") -> "list[Range]":
        union = []
        last = None
        for x in sorted(ranges):
            if last and last.end >= x.start - 1:
                last.end = max(last.end, x.end)
            else:
                last = x
                union.append(last)
        return union

    def __lt__(self, other: "Range") -> bool:
        return self.start < other.start

    def __len__(self) -> int:
        return self.end - self.start + 1

    def __contains__(self, other: int) -> bool:
        return self.start <= other <= self.end

    def overlaps(self, other: "Range") -> bool:
        return self.start <= other.end and other.start <= self.end


def no_beacon_count(sensors, beacons, target_y: int) -> int:
    ranges = []
    target_range = Range(target_y, target_y)
    for (x, y), d in sensors.items():
        if not Range(y - d, y + d).overlaps(target_range):
            continue
        y_dist = d - abs(y - target_y)
        ranges.append(Range(x - y_dist, x + y_dist))
    range = Range.union(*ranges)[0]
    object_xs = {
        x
        for x, y in [*sensors, *beacons]
        if y == target_y and range.overlaps(Range(x, x))
    }
    return len(range) - len(object_xs)


def tuningFrequency(sensors, beacons, space: int) -> int:
    ranges = defaultdict(lambda: [])
    space_range = Range(0, space)
    for (x, y) in [*sensors, *beacons]:
        if y in space_range:
            ranges[y].append(Range(x, x))

    for (sx, sy), d in sensors.items():
        top = sy - d
        bottom = sy + d
        for y in range(max(space_range.start, top), min(space_range.end, bottom)):
            y_dist = d - abs(sy - y)
            ranges[y].append(Range(sx - y_dist, sx + y_dist))

    for y in range(space_range.start, space_range.end + 1):
        union = Range.union(*ranges[y])
        if len(union) > 1:
            return (union[0].end + 1) * FREQUENCY_MULTIPLIER + y
    return -1


def union_ranges(ranges):
    union = []
    for x in sorted(ranges):
        if union and union[-1][1] >= x[0] - 1:
            if union[-1][1] < x[1]:
                union[-1] = (union[-1][0], x[1])
        else:
            union.append(x)
    return union


def tuning_frequency(sensors, beacons, space: int) -> int:
    ranges: list[list[tuple[int, int]]] = [[] for _ in range(space + 1)]
    for x, y in [*sensors, *beacons]:
        if 0 <= y <= space:
            ranges[y].append((x, x))

    # TODO: What if we stepped through y, then sorted sensors, could we do
    # extend and/or simple unions here?
    for (sx, sy), d in sensors.items():
        top = sy - d
        bottom = sy + d
        for y in range(max(0, top), min(space, bottom)):
            y_dist = d - abs(sy - y)
            ranges[y].append((sx - y_dist, sx + y_dist))

    for y in range(space + 1):
        union = union_ranges(ranges[y])
        if len(union) > 1:
            return (union[0][1] + 1) * FREQUENCY_MULTIPLIER + y
    return -1


parts = solve(
    lambda s: no_beacon_count(*parse(s), target_y=2000000),
    # lambda s: tuningFrequency(*parse(s), space=4000000),
    profile(lambda s: tuning_frequency(*parse(s), space=4000000)),
    expect=(5461729, 10621647166538),
)
