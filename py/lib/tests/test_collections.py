import pytest

from aoc.collections import Bitmask, DisjointSet, Range, SummedAreaTable


class TestBitmask:
    def test_from_list_creates_bitmask(self):
        assert Bitmask.from_list([0, 2, 4]) == 0b10101

    def test_from_list_empty(self):
        assert Bitmask.from_list([]) == 0

    def test_on_sets_bit(self):
        bm = Bitmask().on(3)
        assert bm == 0b1000

    def test_on_already_set(self):
        bm = Bitmask.from_list([3])
        bm = bm.on(3)
        assert 3 in bm
        assert bm == 0b1000

    def test_off_clears_bit(self):
        assert Bitmask.from_list([0, 1, 2, 3]).off(1) == 0b1101

    def test_toggle_flips_bit(self):
        bm = Bitmask()
        bm = bm.toggle(2)
        assert 2 in bm
        bm = bm.toggle(2)
        assert 2 not in bm

    def test_contains_checks_bit(self):
        bm = Bitmask.from_list([1, 5, 10])
        assert 1 in bm
        assert 5 in bm
        assert 10 in bm
        assert 0 not in bm
        assert 3 not in bm

    def test_and_operator(self):
        bm1 = Bitmask.from_list([0, 1, 2])
        bm2 = Bitmask.from_list([1, 2, 3])
        result = bm1 & bm2
        assert isinstance(result, Bitmask)
        assert result == 0b110

    def test_or_operator(self):
        bm1 = Bitmask.from_list([0, 1])
        bm2 = Bitmask.from_list([2, 3])
        result = bm1 | bm2
        assert isinstance(result, Bitmask)
        assert result == 0b1111

    def test_xor_operator(self):
        bm1 = Bitmask.from_list([0, 1, 2])
        bm2 = Bitmask.from_list([1, 2, 3])
        result = bm1 ^ bm2
        assert isinstance(result, Bitmask)
        assert result == 0b1001

    def test_rand_operator(self):
        bm = Bitmask.from_list([0, 1, 2])
        result = 0b1110 & bm
        assert isinstance(result, Bitmask)
        assert result == 0b110

    def test_ror_operator(self):
        bm = Bitmask.from_list([0, 1])
        result = 0b100 | bm
        assert isinstance(result, Bitmask)
        assert result == 0b111

    def test_rxor_operator(self):
        bm = Bitmask.from_list([0, 1])
        result = 0b110 ^ bm
        assert isinstance(result, Bitmask)
        assert result == 0b101

    def test_large_bit_index(self):
        bm = Bitmask.from_list([100, 200])
        assert 100 in bm
        assert 200 in bm
        assert 150 not in bm


class TestDisjointSet:
    def test_initial_state(self):
        ds = DisjointSet([1, 2, 3])
        assert len(ds) == 3
        assert ds.root(1) == 1
        assert ds.root(2) == 2
        assert ds.root(3) == 3

    def test_union_two_elements(self):
        ds = DisjointSet([1, 2, 3])
        ds.union(1, 2)
        assert len(ds) == 2
        assert ds.root(1) == ds.root(2)
        assert ds.root(3) == ds.root(3)

    def test_union_same_element(self):
        ds = DisjointSet([1, 2, 3])
        ds.union(1, 1)
        assert len(ds) == 3

    def test_union_already_connected(self):
        ds = DisjointSet([1, 2, 3])
        ds.union(1, 2)
        ds.union(1, 2)
        assert len(ds) == 2

    def test_transitive_union(self):
        ds = DisjointSet([1, 2, 3, 4])
        ds.union(1, 2)
        ds.union(2, 3)
        assert len(ds) == 2

    def test_components_all_separate(self):
        ds = DisjointSet([1, 2, 3])
        components = ds.components()
        assert len(components) == 3
        assert {1} in components
        assert {2} in components
        assert {3} in components

    def test_components_with_unions(self):
        ds = DisjointSet([1, 2, 3, 4, 5])
        ds.union(1, 2)
        ds.union(3, 4)
        components = ds.components()
        assert len(components) == 3
        assert {1, 2} in components
        assert {3, 4} in components
        assert {5} in components

    def test_components_all_merged(self):
        ds = DisjointSet([1, 2, 3, 4])
        ds.union(1, 2)
        ds.union(2, 3)
        ds.union(3, 4)
        components = ds.components()
        assert len(components) == 1
        assert {1, 2, 3, 4} in components

    def test_sizes_all_separate(self):
        ds = DisjointSet([1, 2, 3])
        sizes = ds.sizes()
        assert sorted(sizes) == [1, 1, 1]

    def test_sizes_with_unions(self):
        ds = DisjointSet([1, 2, 3, 4, 5])
        ds.union(1, 2)
        ds.union(3, 4)
        sizes = ds.sizes()
        assert sorted(sizes) == [1, 2, 2]

    def test_sizes_all_merged(self):
        ds = DisjointSet([1, 2, 3, 4])
        ds.union(1, 2)
        ds.union(2, 3)
        ds.union(3, 4)
        sizes = ds.sizes()
        assert sizes == [4]

    def test_single_element(self):
        ds = DisjointSet([42])
        assert len(ds) == 1
        assert ds.root(42) == 42
        assert ds.components() == [{42}]
        assert ds.sizes() == [1]

    def test_merge_into_largest(self):
        ds = DisjointSet([1, 2, 3, 4])
        ds.union(1, 2)
        ds.union(1, 3)
        ds.union(4, 1)
        assert ds.root(4) == 1

    def test_path_compression(self):
        ds = DisjointSet([1, 2, 3, 4])
        # 1 -> 2 -> 3 -> 4
        ds.union(1, 2)
        ds.union(2, 3)
        ds.union(3, 4)

        # all should point directly to root
        root = ds.root(1)
        assert ds.root(1) == root
        assert ds.root(2) == root
        assert ds.root(3) == root
        assert ds.root(4) == root


class TestRange:
    def test_from_str(self):
        r = Range.from_str("10-20")
        assert r.start == 10
        assert r.end == 20

    def test_lt_comparison(self):
        r1 = Range(1, 5)
        r2 = Range(10, 15)
        assert r1 < r2
        assert not (r2 < r1)

    def test_len(self):
        r = Range(5, 10)
        assert len(r) == 6

    def test_len_single_point(self):
        r = Range(5, 5)
        assert len(r) == 1

    def test_contains_value(self):
        r = Range(10, 20)
        assert 10 in r
        assert 15 in r
        assert 20 in r
        assert 9 not in r
        assert 21 not in r

    def test_overlaps_true(self):
        r1 = Range(10, 20)
        r2 = Range(15, 25)
        assert r1.overlaps(r2)
        assert r2.overlaps(r1)

    def test_overlaps_false(self):
        r1 = Range(10, 20)
        r2 = Range(25, 30)
        assert not r1.overlaps(r2)
        assert not r2.overlaps(r1)

    def test_overlaps_adjacent_without_flag(self):
        r1 = Range(10, 20)
        r2 = Range(21, 30)
        assert not r1.overlaps(r2)

    def test_overlaps_adjacent_with_flag(self):
        r1 = Range(10, 20)
        r2 = Range(21, 30)
        assert r1.overlaps(r2, include_adjacent=True)
        assert r2.overlaps(r1, include_adjacent=True)

    def test_overlaps_contained(self):
        r1 = Range(10, 30)
        r2 = Range(15, 20)
        assert r1.overlaps(r2)
        assert r2.overlaps(r1)

    def test_or_merge_overlapping(self):
        r1 = Range(10, 20)
        r2 = Range(15, 25)
        result = r1 | r2
        assert result.start == 10
        assert result.end == 25

    def test_or_merge_adjacent(self):
        r1 = Range(10, 20)
        r2 = Range(21, 30)
        result = r1 | r2
        assert result.start == 10
        assert result.end == 30

    def test_or_raises_on_non_overlapping(self):
        r1 = Range(10, 20)
        r2 = Range(25, 30)
        with pytest.raises(ValueError, match="ranges must overlap or be adjacent"):
            r1 | r2  # pyright: ignore[reportUnusedExpression]

    def test_union_empty_list(self):
        result = Range.union()
        assert result == []

    def test_union_single_range(self):
        r = Range(10, 20)
        result = Range.union(r)
        assert len(result) == 1
        assert result[0] == r

    def test_union_non_overlapping(self):
        r1 = Range(10, 20)
        r2 = Range(30, 40)
        r3 = Range(50, 60)
        result = Range.union(r1, r2, r3)
        assert len(result) == 3
        assert Range(10, 20) in result
        assert Range(30, 40) in result
        assert Range(50, 60) in result

    def test_union_overlapping(self):
        r1 = Range(10, 20)
        r2 = Range(15, 25)
        r3 = Range(22, 30)
        result = Range.union(r1, r2, r3)
        assert len(result) == 1
        assert result[0] == Range(10, 30)

    def test_union_mixed_overlapping(self):
        r1 = Range(10, 20)
        r2 = Range(15, 25)
        r3 = Range(40, 50)
        result = Range.union(r1, r2, r3)
        assert len(result) == 2
        assert Range(10, 25) in result
        assert Range(40, 50) in result

    def test_union_adjacent_ranges(self):
        r1 = Range(10, 20)
        r2 = Range(21, 30)
        result = Range.union(r1, r2)
        assert len(result) == 1
        assert result[0] == Range(10, 30)

    def test_union_unsorted_input(self):
        r1 = Range(30, 40)
        r2 = Range(10, 20)
        r3 = Range(15, 25)
        result = Range.union(r1, r2, r3)
        assert len(result) == 2
        assert Range(10, 25) in result
        assert Range(30, 40) in result


class TestSummedAreaTable:
    def unique_table(self) -> SummedAreaTable:
        # 1 2 3
        # 4 5 6
        # 7 8 9
        def valuefn(p):
            x, y = p
            return y * 3 + x + 1

        return SummedAreaTable(3, 3, valuefn)

    def test_single_cell(self):
        table = SummedAreaTable(1, 1, lambda p: 5)
        assert table[(0, 0), (0, 0)] == 5

    def test_uniform_grid(self):
        table = SummedAreaTable(2, 2, lambda p: 1)
        assert table[(0, 0), (0, 0)] == 1
        assert table[(0, 0), (1, 0)] == 2
        assert table[(0, 0), (0, 1)] == 2
        assert table[(0, 0), (1, 1)] == 4

    def test_specific_values(self):
        table = self.unique_table()
        assert table[(0, 0), (0, 0)] == 1
        assert table[(0, 0), (2, 0)] == 6  # 1 + 2 + 3
        assert table[(0, 0), (0, 2)] == 12  # 1 + 4 + 7
        assert table[(0, 0), (2, 2)] == 45  # 9th triangular number

    def test_subregion(self):
        table = self.unique_table()
        assert table[(1, 1), (1, 1)] == 5
        assert table[(0, 0), (1, 1)] == 12
        assert table[(1, 1), (2, 2)] == 28

    def test_rect_order_doesnt_matter(self):
        table = self.unique_table()
        assert table[(0, 0), (2, 0)] == 6
        assert table[(2, 0), (0, 0)] == 6
