from collections.abc import Generator
from dataclasses import dataclass
from heapq import heappop, heappush
from itertools import count

from aoc import main


@dataclass
class File:
    block: int
    size: int
    id: int

    def checksum(self):
        return sum(i * self.id for i in range(self.block, self.block + self.size))


# -> (block, size, id | None)
def parse(s: str) -> Generator[tuple[int, int, int | None]]:
    id = count()
    block = 0
    for i, c in enumerate(s.strip()):
        size = int(c)
        yield block, size, next(id) if i % 2 == 0 else None
        block += size


def compress_disk(s: str) -> int:
    # Since we're splitting up files, it's simpler to just work on expanded data.
    fs = [c for _, size, id in parse(s) for c in [id] * size]
    free_idx = 0
    for block_idx in range(len(fs) - 1, 0, -1):
        if fs[block_idx] is None:
            continue
        try:
            free_idx = fs.index(None, free_idx, block_idx)
        except ValueError:
            break
        fs[block_idx], fs[free_idx] = fs[free_idx], fs[block_idx]
    return sum(i * c if c is not None else 0 for i, c in enumerate(fs))


def first_space_for(spaces: list[list[int]], file: File) -> tuple[int, int]:
    candidates = []
    for size in range(file.size, 10):
        heap = spaces[size]
        if heap and heap[0] < file.block:
            candidates.append((heap[0], size))
    if not candidates:
        raise ValueError
    block, size = min(candidates)
    heappop(spaces[size])
    return block, size


def defrag_disk(s: str) -> int:
    files: list[File] = []
    spaces = [[] for _ in range(10)]  # one heap per size, storing block ids
    for block, size, id in parse(s):
        if id is None:
            heappush(spaces[size], block)
        else:
            files.append(File(block, size, id))

    for file in reversed(files):
        try:
            block, size = first_space_for(spaces, file)
        except ValueError:
            continue
        file.block = block
        extra_space = size - file.size
        if extra_space > 0:
            heappush(spaces[size - file.size], block + file.size)

    return sum(file.checksum() for file in files)


if __name__ == "__main__":
    main(compress_disk, defrag_disk)
