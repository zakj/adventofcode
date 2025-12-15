from collections.abc import Iterable
from itertools import batched

from aoc import main
from aoc.parse import all_numbers
from aoc.util import ndigits

# Used for my quick and dirty solution, but much slower than the current approach.
# repeated_twice_re = re.compile(r"^(\d+)\1$")
# repeated_re = re.compile(r"^(\d+)\1+$")


def parse(input: str) -> Iterable[tuple[int, ...]]:
    yield from batched(all_numbers(input, unsigned=True), 2)


# A d-digit number composed entirely of a repeated n-digit pattern will be
# evenly divisible by (10**d - 1) / (10**n - 1).
#
# for example:
#   4444: (10**4 - 1) / (10**2 - 1) == 9999 / 99 == 101
#   4444: (10**4 - 1) / (10**1 - 1) == 9999 / 9  == 1111
#   4444 % 101 == 4444 % 1111 == 0
def repeated_mods(digits: int, twice=False) -> list[int]:
    if twice:
        ns = [digits // 2] if digits % 2 == 0 else []
    else:
        ns = [i for i in range(1, digits // 2 + 1) if digits % i == 0]
    numerator = 10**digits - 1
    return [numerator // (10**n - 1) for n in ns]


def repeating_numbers(ranges: Iterable[tuple[int, ...]], twice: bool) -> set[int]:
    found = set()
    for start, end in ranges:
        # split into ranges of unique digit count
        for d in range(ndigits(start), ndigits(end) + 1):
            lo = max(start, 10 ** (d - 1))
            hi = min(end, 10**d - 1)
            for step in repeated_mods(d, twice):
                # start at the previous repeat for this mod
                for n in range(lo - lo % step, hi + 1, step):
                    if n >= lo:
                        found.add(n)
    return found


if __name__ == "__main__":
    main(
        lambda s: sum(repeating_numbers(parse(s), twice=True)),
        lambda s: sum(repeating_numbers(parse(s), twice=False)),
    )
