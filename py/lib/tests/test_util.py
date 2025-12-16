import pytest

from aoc.util import (
    chunks,
    flip_rows_cols,
    mod_range,
    ndigits,
    ocr,
    rotate_ccw,
    rotate_cw,
    sliding_window,
    takeuntil,
)


class TestChunks:
    def test_even_split(self):
        result = chunks([1, 2, 3, 4, 5, 6], 2)
        assert result == [[1, 2], [3, 4], [5, 6]]

    def test_uneven_split(self):
        result = chunks([1, 2, 3, 4, 5], 2)
        assert result == [[1, 2], [3, 4], [5]]

    def test_chunk_size_one(self):
        result = chunks([1, 2, 3], 1)
        assert result == [[1], [2], [3]]

    def test_chunk_size_larger_than_list(self):
        result = chunks([1, 2, 3], 5)
        assert result == [[1, 2, 3]]

    def test_empty_list(self):
        result = chunks([], 3)
        assert result == []

    def test_single_element(self):
        result = chunks([42], 1)
        assert result == [[42]]


class TestSlidingWindow:
    def test_basic_window(self):
        result = list(sliding_window("ABCDEFG", 4))
        assert result == [
            ("A", "B", "C", "D"),
            ("B", "C", "D", "E"),
            ("C", "D", "E", "F"),
            ("D", "E", "F", "G"),
        ]

    def test_window_size_two(self):
        result = list(sliding_window([1, 2, 3, 4], 2))
        assert result == [(1, 2), (2, 3), (3, 4)]

    def test_window_size_one(self):
        result = list(sliding_window([1, 2, 3], 1))
        assert result == [(1,), (2,), (3,)]

    def test_window_size_equals_length(self):
        result = list(sliding_window([1, 2, 3], 3))
        assert result == [(1, 2, 3)]

    def test_window_larger_than_iterable(self):
        result = list(sliding_window([1, 2], 5))
        assert result == []

    def test_empty_iterable(self):
        result = list(sliding_window([], 3))
        assert result == []


class TestTakeUntil:
    def test_includes_matching_element(self):
        result = list(takeuntil(lambda x: x > 5, [1, 2, 3, 6, 7]))
        assert result == [1, 2, 3, 6]

    def test_never_matches(self):
        result = list(takeuntil(lambda x: x > 10, [1, 2, 3]))
        assert result == [1, 2, 3]

    def test_matches_first_element(self):
        result = list(takeuntil(lambda x: x == 1, [1, 2, 3]))
        assert result == [1]

    def test_empty_iterable(self):
        result = list(takeuntil(lambda x: x == 5, []))
        assert result == []

    def test_with_strings(self):
        result = list(takeuntil(lambda x: x == "!", ["hello", "world", "!", "end"]))
        assert result == ["hello", "world", "!"]


class TestNDigits:
    testdata = (
        (5, 1),
        (9, 1),
        (10, 2),
        (99, 2),
        (100, 3),
        (999, 3),
        (1234567890, 10),
    )

    @pytest.mark.parametrize("d,expected", testdata)
    def test(self, d: int, expected: int):
        assert ndigits(d) == expected


class TestMod:
    testdata = (
        ((0, 1, 5), 4),
        ((1, 1, 5), 1),
        ((2, 1, 5), 2),
        ((3, 1, 5), 3),
        ((4, 1, 5), 4),
        ((5, 1, 5), 1),
        ((-1, 1, 5), 3),
        ((-2, 1, 5), 2),
    )

    @pytest.mark.parametrize("args, expected", testdata)
    def test(self, args, expected):
        assert mod_range(*args) == expected


class TestRotateCW:
    def test_square_rotation(self):
        lines = ["AB", "CD"]
        result = rotate_cw(lines)
        assert result == ["CA", "DB"]

    def test_3x3_rotation(self):
        lines = ["ABC", "DEF", "GHI"]
        result = rotate_cw(lines)
        assert result == ["GDA", "HEB", "IFC"]

    def test_single_row(self):
        lines = ["ABC"]
        result = rotate_cw(lines)
        assert result == ["A", "B", "C"]

    def test_single_column(self):
        lines = ["A", "B", "C"]
        result = rotate_cw(lines)
        assert result == ["CBA"]

    def test_rectangular(self):
        lines = ["AB", "CD", "EF"]
        result = rotate_cw(lines)
        assert result == ["ECA", "FDB"]

    def test_strips_whitespace(self):
        lines = ["A  ", "B  "]
        result = rotate_cw(lines)
        assert result == ["BA", "", ""]


class TestRotateCCW:
    def test_square_rotation(self):
        lines = ["AB", "CD"]
        result = rotate_ccw(lines)
        assert result == ["BD", "AC"]

    def test_3x3_rotation(self):
        lines = ["ABC", "DEF", "GHI"]
        result = rotate_ccw(lines)
        assert result == ["CFI", "BEH", "ADG"]

    def test_single_row(self):
        lines = ["ABC"]
        result = rotate_ccw(lines)
        assert result == ["C", "B", "A"]

    def test_single_column(self):
        lines = ["A", "B", "C"]
        result = rotate_ccw(lines)
        assert result == ["ABC"]

    def test_rectangular(self):
        lines = ["AB", "CD", "EF"]
        result = rotate_ccw(lines)
        assert result == ["BDF", "ACE"]

    def test_double_rotation_is_180(self):
        lines = ["AB", "CD"]
        result = rotate_ccw(rotate_ccw(lines))
        assert result == ["DC", "BA"]


class TestFlipRowsCols:
    def test_square_transpose(self):
        lines = ["AB", "CD"]
        result = flip_rows_cols(lines)
        assert result == ["AC", "BD"]

    def test_3x3_transpose(self):
        lines = ["ABC", "DEF", "GHI"]
        result = flip_rows_cols(lines)
        assert result == ["ADG", "BEH", "CFI"]

    def test_rectangular(self):
        lines = ["AB", "CD", "EF"]
        result = flip_rows_cols(lines)
        assert result == ["ACE", "BDF"]

    def test_single_row(self):
        lines = ["ABC"]
        result = flip_rows_cols(lines)
        assert result == ["A", "B", "C"]

    def test_single_column(self):
        lines = ["A", "B", "C"]
        result = flip_rows_cols(lines)
        assert result == ["ABC"]

    def test_double_flip_is_identity(self):
        lines = ["ABC", "DEF"]
        result = flip_rows_cols(flip_rows_cols(lines))
        assert result == list(lines)

    def test_strips_whitespace(self):
        lines = ["A  ", "B  ", "C  "]
        result = flip_rows_cols(lines)
        assert result == ["ABC", "", ""]


class TestOCR:
    def test_full_word(self):
        lines = [
            " ##   ##   ##  ",
            "#  # #  # #  # ",
            "#  # #  # #    ",
            "#### #  # #    ",
            "#  # #  # #  # ",
            "#  #  ##   ##  ",
        ]
        assert ocr(lines, "4x6") == "AOC"
