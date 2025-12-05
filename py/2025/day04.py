from aoc import main
from aoc.coords import Dir8, Grid, Point


def accessible_rolls(rolls: set[Point]) -> set[Point]:
    def neighbor_rolls(p: Point) -> list[Point]:
        return [n for n in Dir8.neighbors(p) if n in rolls]

    return {p for p in rolls if len(neighbor_rolls(p)) < 4}


def removable_rolls(rolls: set[Point]) -> set[Point]:
    to_remove = None
    removed = set()
    while True:
        to_remove = accessible_rolls(rolls)
        if not to_remove:
            break
        rolls -= to_remove
        removed |= to_remove
    return removed


if __name__ == "__main__":
    main(
        lambda s: len(accessible_rolls(set(Grid(s).findall("@")))),
        lambda s: len(removable_rolls(set(Grid(s).findall("@")))),
    )
