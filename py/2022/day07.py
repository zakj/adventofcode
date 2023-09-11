from aoc import main


def parse(s: str) -> dict[str, int]:
    tree = {"/": 0}
    pwd = ["/"]
    for line in s.splitlines():
        match line.split(" "):
            case "$", "cd", dirname if dirname == "..":
                pwd.pop()
            case "$", "cd", dirname if dirname != "/":
                pwd.append(f"{pwd[-1]}/{dirname}")
                tree[pwd[-1]] = 0
            case ("$", "ls") | ("dir", _):
                pass
            case size, _:
                for path in pwd:
                    tree[path] += int(size)
    return tree


def to_delete(tree: dict[str, int], fs_size=70000000, req_size=30000000) -> int:
    needed = req_size - (fs_size - tree["/"])
    return min(s for s in tree.values() if s >= needed)


if __name__ == "__main__":
    main(
        lambda s: sum(size for size in parse(s).values() if size < 100000),
        lambda s: to_delete(parse(s)),
    )
