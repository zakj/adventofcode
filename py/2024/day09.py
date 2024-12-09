from dataclasses import dataclass

from aoc import main, status


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
        status(str(i))
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
    tried: bool = False

    def __str__(self) -> str:
        return "".join(["." if self.id is None else str(self.id)] * self.size)


def part2(s: str) -> int:
    id = 0
    block = True
    fs = []
    for c in s.strip():
        size = int(c)
        if block:
            fs.append(Block(id, size))
            id += 1
        else:
            fs.append(Block(None, size))
        block = not block

    while True:
        try:
            block_idx = next(
                i
                for i in range(len(fs) - 1, 0, -1)
                if fs[i].id is not None and not fs[i].tried
            )
        except StopIteration:
            break
        block = fs[block_idx]
        block.tried = True
        try:
            first_free_idx = next(
                j
                for j in range(block_idx)
                if fs[j].id is None and fs[j].size >= block.size
            )
            free_block = fs[first_free_idx]
            fs[first_free_idx] = block
            fs[block_idx] = Block(None, block.size)

            extra_space = free_block.size - block.size
            if extra_space > 0:
                fs = (
                    fs[: first_free_idx + 1]
                    + [Block(None, extra_space)]
                    + fs[first_free_idx + 1 :]
                )
        except StopIteration:
            continue

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
