from aoc import solve


def parse(s: str) -> list[int]:
    return [int(n) for n in s.splitlines()]


def decrypt_coordinates(data: list[int], key: int = 1, iterations: int = 1) -> int:
    values = [v * key for v in data]
    length = len(values)
    indexes = list(range(length))
    for _ in range(iterations):
        for i in range(length):
            pos = indexes.index(i)
            indexes.pop(pos)
            indexes.insert((pos + values[i]) % (length - 1), i)

    zero = indexes.index(values.index(0))
    return sum(values[indexes[(zero + n) % length]] for n in [1000, 2000, 3000])


parts = solve(
    lambda s: decrypt_coordinates(parse(s)),
    lambda s: decrypt_coordinates(parse(s), key=811589153, iterations=10),
    expect=(8721, 831878881825),
)
