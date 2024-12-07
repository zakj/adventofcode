from aoc import main
from parse import all_numbers, line_parser


@line_parser
def parse(line: str) -> tuple[int, list[int]]:
    target, *values = all_numbers(line)
    return target, values


def is_valid(target: int, values: list[int], with_concat=False) -> bool:
    *values, last = values
    if not values:
        return last == target

    # Could we add?
    if is_valid(target - last, values, with_concat):
        return True

    # Could we multiply?
    if target % last == 0 and is_valid(target // last, values, with_concat):
        return True

    # Could we concatenate?
    shift = 10 ** len(str(last))
    return (
        with_concat
        and (target - last) % shift == 0
        and is_valid((target - last) // shift, values, with_concat)
    )


def sum_valid_targets(s: str, with_concat=False) -> int:
    return sum(
        target for target, values in parse(s) if is_valid(target, values, with_concat)
    )


if __name__ == "__main__":
    main(
        lambda s: sum_valid_targets(s),
        lambda s: sum_valid_targets(s, with_concat=True),
    )
