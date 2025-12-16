import pytest

from aoc.coords import (
    Dir,
    Dir8,
    Grid,
    addp,
    area,
    find_bounds,
    line_between,
    mdist,
    opposite,
    print_sparse_grid,
    subp,
    turn_left,
    turn_right,
)


class TestDir:
    def test_iterable(self):
        assert set(Dir) == {Dir.N, Dir.E, Dir.S, Dir.W}

    def test_neighbors_returns_4_points(self):
        neighbors = Dir.neighbors((0, 0))
        assert len(list(neighbors)) == 4

    def test_neighbors_correct_positions(self):
        assert set(Dir.neighbors((5, 5))) == {(5, 4), (6, 5), (5, 6), (4, 5)}

    @pytest.mark.parametrize(
        "s,expected",
        [
            ("N", Dir.N),
            ("E", Dir.E),
            ("S", Dir.S),
            ("W", Dir.W),
            ("U", Dir.N),
            ("^", Dir.N),
            ("R", Dir.E),
            (">", Dir.E),
            ("D", Dir.S),
            ("v", Dir.S),
            ("L", Dir.W),
            ("<", Dir.W),
        ],
    )
    def test_parse(self, s, expected):
        assert Dir.parse(s) == expected


class TestDir8:
    def test_iterable(self):
        assert len(list(Dir8)) == 8

    def test_neighbors_returns_8_points(self):
        neighbors = Dir8.neighbors((5, 5))
        assert len(list(neighbors)) == 8

    def test_neighbors_correct_positions(self):
        assert set(Dir8.neighbors((5, 5))) == {
            (5, 4),  # N
            (6, 4),  # NE
            (6, 5),  # E
            (6, 6),  # SE
            (5, 6),  # S
            (4, 6),  # SW
            (4, 5),  # W
            (4, 4),  # NW
        }


class TestGrid:
    def test_init_simple(self):
        grid = Grid("ABC\nDEF")
        assert grid.width == 3
        assert grid.height == 2
        assert grid[0, 0] == "A"
        assert grid[2, 1] == "F"

    def test_init_with_mapfn(self):
        grid = Grid("123\n456", mapfn=int)
        assert grid[0, 0] == 1
        assert grid[2, 1] == 6

    def test_repr(self):
        grid = Grid("AB\nCD")
        repr_str = repr(grid)
        assert "width=2" in repr_str
        assert "height=2" in repr_str

    def test_contains(self):
        grid = Grid("AB\nCD")
        assert (0, 0) in grid
        assert (1, 1) in grid
        assert (5, 5) not in grid

    def test_getitem(self):
        grid = Grid("AB\nCD")
        assert grid[0, 0] == "A"
        assert grid[1, 0] == "B"
        assert grid[0, 1] == "C"
        assert grid[1, 1] == "D"

    def test_setitem(self):
        grid = Grid("AB\nCD")
        grid[0, 0] = "X"
        assert grid[0, 0] == "X"

    def test_find_single_value(self):
        grid = Grid("AB\nCD")
        assert grid.find("C") == (0, 1)

    def test_find_returns_first(self):
        grid = Grid("AA\nAA")
        pos = grid.find("A")
        assert grid[pos] == "A"

    def test_findall_single(self):
        grid = Grid("AB\nCD")
        assert grid.findall("A") == [(0, 0)]

    def test_findall_multiple(self):
        grid = Grid("ABA\nCDC")
        a_positions = grid.findall("A")
        assert len(a_positions) == 2
        assert (0, 0) in a_positions
        assert (2, 0) in a_positions

    def test_findall_none(self):
        grid = Grid("AB\nCD")
        assert grid.findall("X") == []

    def test_get_exists(self):
        grid = Grid("AB\nCD")
        assert grid.get((0, 0)) == "A"

    def test_get_missing_with_default(self):
        grid = Grid("AB\nCD")
        assert grid.get((5, 5), "X") == "X"

    def test_get_missing_no_default(self):
        grid = Grid("AB\nCD")
        assert grid.get((5, 5)) is None


class TestMDist:
    def test_same_point(self):
        assert mdist((0, 0), (0, 0)) == 0

    def test_horizontal_distance(self):
        assert mdist((0, 0), (5, 0)) == 5

    def test_vertical_distance(self):
        assert mdist((0, 0), (0, 5)) == 5

    def test_diagonal_distance(self):
        assert mdist((0, 0), (3, 4)) == 7

    def test_negative_coordinates(self):
        assert mdist((-3, -4), (2, 1)) == 10


class TestOpposite:
    def test_north_south(self):
        assert opposite(Dir.N) == Dir.S
        assert opposite(Dir.S) == Dir.N

    def test_east_west(self):
        assert opposite(Dir.E) == Dir.W
        assert opposite(Dir.W) == Dir.E

    def test_diagonal(self):
        assert opposite((1, 1)) == (-1, -1)
        assert opposite((-2, 3)) == (2, -3)


class TestAddP:
    def test_add_zero(self):
        assert addp((5, 5), (0, 0)) == (5, 5)

    def test_add_positive(self):
        assert addp((3, 4), (2, 1)) == (5, 5)

    def test_add_negative(self):
        assert addp((5, 5), (-2, -3)) == (3, 2)

    def test_add_direction(self):
        assert addp((5, 5), Dir.N) == (5, 4)
        assert addp((5, 5), Dir.E) == (6, 5)


class TestSubP:
    def test_sub_zero(self):
        assert subp((5, 5), (0, 0)) == (5, 5)

    def test_sub_positive(self):
        assert subp((5, 5), (2, 1)) == (3, 4)

    def test_sub_negative(self):
        assert subp((3, 2), (-2, -3)) == (5, 5)

    def test_sub_direction(self):
        assert subp((5, 5), Dir.N) == (5, 6)
        assert subp((5, 5), Dir.E) == (4, 5)


class TestTurnRight:
    def test_cardinal_directions(self):
        assert turn_right(Dir.N) == Dir.E
        assert turn_right(Dir.E) == Dir.S
        assert turn_right(Dir.S) == Dir.W
        assert turn_right(Dir.W) == Dir.N

    def test_custom_vector(self):
        assert turn_right((2, 0)) == (0, 2)
        assert turn_right((0, 3)) == (-3, 0)


class TestTurnLeft:
    def test_cardinal_directions(self):
        assert turn_left(Dir.N) == Dir.W
        assert turn_left(Dir.W) == Dir.S
        assert turn_left(Dir.S) == Dir.E
        assert turn_left(Dir.E) == Dir.N

    def test_custom_vector(self):
        assert turn_left((2, 0)) == (0, -2)
        assert turn_left((0, 3)) == (3, 0)


class TestArea:
    def test_single_cell(self):
        assert area((0, 0), (0, 0)) == 1

    def test_horizontal_line(self):
        assert area((0, 0), (4, 0)) == 5

    def test_vertical_line(self):
        assert area((0, 0), (0, 4)) == 5

    def test_rectangle(self):
        assert area((0, 0), (3, 2)) == 12  # 4x3

    def test_order_independent(self):
        assert area((0, 0), (3, 2)) == area((3, 2), (0, 0))

    def test_negative_coordinates(self):
        assert area((-1, -1), (1, 1)) == 9  # 3x3


class TestFindBounds:
    def test_single_point(self):
        assert find_bounds([(5, 7)]) == ((5, 7), (5, 7))

    def test_multiple_points(self):
        points = [(0, 0), (5, 3), (2, 8)]
        assert find_bounds(points) == ((0, 0), (5, 8))

    def test_negative_coordinates(self):
        points = [(-3, -2), (5, 7), (0, 0)]
        assert find_bounds(points) == ((-3, -2), (5, 7))

    def test_empty_raises(self):
        with pytest.raises(ValueError):
            find_bounds([])


class TestLineBetween:
    def test_same_point(self):
        assert line_between((0, 0), (0, 0)) == [(0, 0)]

    def test_horizontal_line(self):
        result = line_between((0, 0), (3, 0))
        assert result == [(0, 0), (1, 0), (2, 0), (3, 0)]

    def test_vertical_line(self):
        result = line_between((0, 0), (0, 3))
        assert result == [(0, 0), (0, 1), (0, 2), (0, 3)]

    def test_diagonal_line(self):
        result = line_between((0, 0), (2, 2))
        assert result == [(0, 0), (1, 1), (2, 2)]

    def test_non_aligned_diagonal(self):
        result = line_between((0, 0), (4, 2))
        assert result == [(0, 0), (2, 1), (4, 2)]

    def test_reverse_direction(self):
        result = line_between((3, 0), (0, 0))
        assert result == [(3, 0), (2, 0), (1, 0), (0, 0)]

    def test_negative_slope(self):
        result = line_between((0, 2), (2, 0))
        assert result == [(0, 2), (1, 1), (2, 0)]
