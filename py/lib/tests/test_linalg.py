from fractions import Fraction

from aoc.linalg import to_reduced_row_echelon_form


class TestToReducedRowEchelonForm:
    def test_simple_2x3_system(self):
        # x + y = 3
        # 2x - y = 0
        # Solution: x = 1, y = 2
        matrix = [[1, 1, 3], [2, -1, 0]]
        result = to_reduced_row_echelon_form(matrix)
        assert result == [[1, 0, 1], [0, 1, 2]]

    def test_simple_3x4_system(self):
        # x + y + z = 6
        # 2x + y - z = 1
        # x - y + z = 2
        # Solution: x = 1, y = 2, z = 3
        matrix = [[1, 1, 1, 6], [2, 1, -1, 1], [1, -1, 1, 2]]
        result = to_reduced_row_echelon_form(matrix)
        assert result == [[1, 0, 0, 1], [0, 1, 0, 2], [0, 0, 1, 3]]

    def test_already_reduced(self):
        matrix = [[1, 0, 5], [0, 1, 3]]
        result = to_reduced_row_echelon_form(matrix)
        assert result == [[1, 0, 5], [0, 1, 3]]

    def test_requires_row_swap(self):
        # 0x + y = 2
        # x + 0y = 3
        matrix = [[0, 1, 2], [1, 0, 3]]
        result = to_reduced_row_echelon_form(matrix)
        assert result == [[1, 0, 3], [0, 1, 2]]

    def test_with_fractions(self):
        # 2x + 4y = 10
        # 3x + y = 8
        # Solution: x = 11/5, y = 7/5
        matrix = [[2, 4, 10], [3, 1, 8]]
        result = to_reduced_row_echelon_form(matrix)
        assert result == [[1, 0, Fraction(11, 5)], [0, 1, Fraction(7, 5)]]

    def test_single_equation(self):
        # 2x = 6
        matrix = [[2, 6]]
        result = to_reduced_row_echelon_form(matrix)
        assert result == [[1, 3]]

    def test_negative_values(self):
        # -x + y = 1
        # x + y = 5
        # Solution: x = 2, y = 3
        matrix = [[-1, 1, 1], [1, 1, 5]]
        result = to_reduced_row_echelon_form(matrix)
        assert result == [[1, 0, 2], [0, 1, 3]]

    def test_zero_column(self):
        # 0x + y = 2
        # 0x + 2y = 4
        # Free variable x, y = 2
        matrix = [[0, 1, 2], [0, 2, 4]]
        result = to_reduced_row_echelon_form(matrix)
        assert result[0] == [0, 1, 2]
        assert result[1] == [0, 0, 0]

    def test_larger_system(self):
        # 2x + y - z = 8
        # -3x - y + 2z = -11
        # -2x + y + 2z = -3
        # Solution: x = 2, y = 3, z = -1
        matrix = [
            [2, 1, -1, 8],
            [-3, -1, 2, -11],
            [-2, 1, 2, -3],
        ]
        assert to_reduced_row_echelon_form(matrix) == [
            [1, 0, 0, 2],
            [0, 1, 0, 3],
            [0, 0, 1, -1],
        ]

    def test_undetermined_system(self):
        matrix = [
            [1, 3, 1, 9],
            [1, 1, -1, 1],
            [3, 11, 5, 35],
        ]
        assert to_reduced_row_echelon_form(matrix) == [
            [1, 0, -2, -3],
            [0, 1, 1, 4],
            [0, 0, 0, 0],
        ]
