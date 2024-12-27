from dataclasses import dataclass
from itertools import product
from typing import Final

from aoc import main
from aoc.coords import Point, mdist
from aoc.parse import all_numbers

FREQUENCY_MULTIPLIER: Final[int] = 4000000


def parse(s: str) -> tuple[dict[Point, int], list[Point]]:
    sensors = {}
    beacons = []
    for line in s.splitlines():
        (sx, sy, bx, by) = all_numbers(line)
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


# https://www.reddit.com/r/adventofcode/comments/zmcn64/comment/j0b90nr/
def tuning_frequency(sensors, beacons, space: int) -> int:
    acoeffs, bcoeffs = set(), set()
    for (x, y), d in sensors.items():
        acoeffs.add(y - x + d + 1)
        acoeffs.add(y - x - d - 1)
        bcoeffs.add(x + y + d + 1)
        bcoeffs.add(x + y - d - 1)
    for a, b in product(acoeffs, bcoeffs):
        x, y = (b - a) // 2, (b + a) // 2
        if 0 < x < space and 0 < y < space:
            if all(mdist((x, y), t) > sensors[t] for t in sensors):
                return FREQUENCY_MULTIPLIER * x + y
    return -1


if __name__ == "__main__":
    main(
        lambda s, target_y: no_beacon_count(*parse(s), target_y),
        lambda s, space: tuning_frequency(*parse(s), space),
    )
