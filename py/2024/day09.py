from dataclasses import dataclass
from itertools import count

from aoc import main


@dataclass
class Block:
    id: int | None
    size: int

    def __str__(self) -> str:
        return "".join(["." if self.id is None else str(self.id)] * self.size)

    def expand(self) -> list[int | None]:
        return [self.id] * self.size


def parse(s: str) -> list[Block]:
    id = count()
    return [
        Block(next(id) if i % 2 == 0 else None, int(c)) for i, c in enumerate(s.strip())
    ]


def checksum(expanded: list[int | None]) -> int:
    return sum(i * c if c is not None else 0 for i, c in enumerate(expanded))


def compress_disk(s: str) -> int:
    # Since we're splitting up files, it's simpler to just work on expanded data.
    fs = [c for block in parse(s) for c in block.expand()]
    first_free_idx = 0
    for i in range(len(fs) - 1, 0, -1):
        if fs[i] is None:
            continue
        try:
            first_free_idx = fs.index(None, first_free_idx, i)
        except ValueError:
            break
        fs[i], fs[first_free_idx] = fs[first_free_idx], fs[i]
    return checksum(fs)


def defrag_disk(s: str) -> int:
    # Conceptually, this should not use a range: we are adding to the array
    # during iteration. I previously was backtracking each iteration to find the
    # next-untried file. But this is a lot faster, and because the input
    # alternates between files and free space, we are inserting only one item
    # into the array, and we only care about files here, it's safe in this case:
    # we only ever skip processing a free block.
    fs = parse(s)
    for block_idx in range(len(fs) - 1, 0, -1):
        block = fs[block_idx]
        if block.id is None:
            continue
        first_free_idx = next(
            (
                j
                for j in range(block_idx)
                if fs[j].id is None and fs[j].size >= block.size
            ),
            None,
        )
        if first_free_idx is None:
            continue
        free_block = fs[first_free_idx]
        fs[first_free_idx] = block
        fs[block_idx] = Block(None, block.size)

        extra_space = free_block.size - block.size
        if extra_space > 0:
            fs.insert(first_free_idx + 1, Block(None, extra_space))

    expanded = [c for block in fs for c in block.expand()]
    return checksum(expanded)


if __name__ == "__main__":
    main(compress_disk, defrag_disk)
