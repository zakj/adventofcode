from dataclasses import dataclass

from aoc import main


def parse(s: str):
    pass


def part1(s: str) -> int:
    id = 0
    block = True
    fs = []
    for c in s.strip():
        size = int(c)
        if block:
            fs.extend([str(id)] * size)
            id += 1
        else:
            fs.extend("." * size)
        block = not block
    last_free_idx = 0
    for i in range(len(fs) - 1, 0, -1):
        c = fs[i]
        first_free_idx = fs.index(".", last_free_idx)
        last_free_idx = first_free_idx
        if first_free_idx >= i:
            break
        fs[i], fs[first_free_idx] = fs[first_free_idx], fs[i]

    checksum = 0
    for i, c in enumerate(fs):
        if c != ".":
            checksum += i * int(c)

    return checksum


@dataclass
class Block:
    id: int | None
    size: int

    def __str__(self) -> str:
        return "".join(["." if self.id is None else str(self.id)] * self.size)


def part2(s: str) -> int:
    id = 0
    block = True
    fs: list[Block] = []
    for c in s.strip():
        size = int(c)
        if block:
            fs.append(Block(id, size))
            id += 1
        else:
            fs.append(Block(None, size))
        block = not block

    # Conceptually, this should not use a range: we are adding to the array
    # during iteration. I previously was backtracking each iteration to find the
    # next-untried file. But this is a lot faster, and because the input
    # alternates between files and free space, we are inserting only one item
    # into the array, and we only care about files here, it's safe in this case:
    # we only ever skip processing a free block.
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

    checksum = 0
    i = 0
    for block in fs:
        if block.id:
            for j in range(i, i + block.size):
                checksum += j * block.id
        i += block.size

    return checksum


if __name__ == "__main__":
    main(
        part1,
        part2,
    )
