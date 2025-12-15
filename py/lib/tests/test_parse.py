import pytest
from aoc.parse import all_numbers, first_number, line_parser, paras


class TestAllNumbers:
    def test_single_number(self):
        assert all_numbers("42") == [42]

    def test_multiple_numbers(self):
        assert all_numbers("1 2 3") == [1, 2, 3]

    def test_negative_numbers(self):
        assert all_numbers("-1 -2 -3") == [-1, -2, -3]

    def test_positive_sign(self):
        assert all_numbers("+5 +10") == [5, 10]

    def test_mixed_signs(self):
        assert all_numbers("-1 +2 3") == [-1, 2, 3]

    def test_unsigned(self):
        assert all_numbers("10-20,30-40", unsigned=True) == [10, 20, 30, 40]

    def test_numbers_in_text(self):
        assert all_numbers("x=10, y=-5, z=3") == [10, -5, 3]

    def test_no_numbers(self):
        assert all_numbers("hello world") == []

    def test_empty_string(self):
        assert all_numbers("") == []

    def test_multiline(self):
        assert all_numbers("10\n20") == [10, 20]


class TestFirstNumber:
    def test_single_number(self):
        assert first_number("42") == 42

    def test_multiple_numbers(self):
        assert first_number("1 2 3") == 1

    def test_negative_number(self):
        assert first_number("-42") == -42

    def test_positive_sign(self):
        assert first_number("+42") == 42

    def test_unsigned(self):
        assert first_number("-42", unsigned=True) == 42

    def test_number_in_text(self):
        assert first_number("x = 10") == 10

    def test_no_numbers_raises_error(self):
        with pytest.raises(ValueError, match="no numbers found"):
            first_number("spam")

    def test_empty_string_raises_error(self):
        with pytest.raises(ValueError, match="no numbers found"):
            first_number("")


class TestLineParser:
    def test_simple_function(self):
        @line_parser
        def parse_int(s: str) -> int:
            return int(s)

        assert parse_int("1\n2\n3") == [1, 2, 3]

    def test_empty_string(self):
        @line_parser
        def parse_int(s: str) -> int:
            return int(s)

        assert parse_int("") == []

    def test_single_line(self):
        @line_parser
        def identity(s: str) -> str:
            return s

        assert identity("single") == ["single"]


class TestParas:
    def test_simple_paragraphs(self):
        text = "line1\nline2\n\nline3\nline4"
        assert paras(text) == [["line1", "line2"], ["line3", "line4"]]

    def test_single_paragraph(self):
        text = "line1\nline2"
        assert paras(text) == [["line1", "line2"]]

    def test_empty_string(self):
        assert paras("") == [[]]

    def test_single_line(self):
        assert paras("single") == [["single"]]

    def test_with_mapper(self):
        text = "1\n2\n\n3\n4"
        assert paras(text, int) == [[1, 2], [3, 4]]

    def test_compress_multiple_blank_lines(self):
        text = "a\n\n\nb"
        assert paras(text) == [["a"], ["b"]]

    def test_trailing_newline(self):
        text = "line1\nline2\n"
        assert paras(text) == [["line1", "line2"]]

    def test_with_mapper_and_multiple_paragraphs(self):
        text = "1\n2\n\n3\n4\n\n5"
        assert paras(text, lambda x: int(x) * 2) == [[2, 4], [6, 8], [10]]
