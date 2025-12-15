from typing import ClassVar

from aoc.graph_dyn import (
    DiGraph,
    Goal,
    all_shortest_path_lengths,
    all_shortest_paths,
    shortest_path,
    shortest_path_length,
)


def simple_graph():
    """Linear graph: 1 -> 2 -> 3"""
    return {1: {2}, 2: {3}, 3: set()}


def diamond_graph():
    """Diamond shape with multiple paths: 1 -> {2, 3} -> 4"""
    return {1: {2, 3}, 2: {4}, 3: {4}, 4: set()}


def disconnected_graph():
    """Graph with disconnected nodes: 1 -> 2 // 3 -> 4"""
    return {1: {2}, 2: set(), 3: {4}, 4: set()}


class WeightedGraph(DiGraph[str]):
    weights: ClassVar[dict[tuple[str, str], int]] = {
        ("A", "B"): 1,
        ("A", "C"): 5,
        ("B", "D"): 1,
        ("C", "D"): 1,
    }

    def __init__(self):
        self.edges: dict[str, set[str]] = {}
        for a, b in self.weights:
            self.edges.setdefault(a, set()).add(b)

    def __getitem__(self, node: str) -> set[str]:
        return self.edges.get(node, set())

    def weight(self, a: str, b: str) -> int:
        return self.weights[a, b]


class TestGoal:
    def test_goal_matches(self):
        goal = Goal[int](lambda x: x > 5)
        assert goal == 6
        assert goal == 10
        assert goal != 5
        assert goal != 3


class TestShortestPathLength:
    def test_simple_path(self):
        G = simple_graph()
        assert shortest_path_length(G, 1, 2) == 1
        assert shortest_path_length(G, 1, 3) == 2

    def test_same_source_and_target(self):
        G = simple_graph()
        assert shortest_path_length(G, 1, 1) == 0

    # TODO: None or NoPath exception instead? have to address callers
    def test_no_path_returns_negative_one(self):
        G = disconnected_graph()
        assert shortest_path_length(G, 1, 3) == -1
        assert shortest_path_length(G, 1, 4) == -1

    def test_diamond_graph_multiple_paths(self):
        G = diamond_graph()
        assert shortest_path_length(G, 1, 4) == 2

    def test_weighted_graph(self):
        G = WeightedGraph()
        # A -> B -> D = 1 + 1 = 2
        # A -> C -> D = 5 + 1 = 6
        assert shortest_path_length(G, "A", "D", G.weight) == 2

    def test_no_target_returns_all_distances(self):
        G = simple_graph()
        distances = shortest_path_length(G, 1)
        assert distances == {1: 0, 2: 1, 3: 2}

    def test_no_target_with_disconnected_graph(self):
        G = disconnected_graph()
        distances = shortest_path_length(G, 1)
        assert distances == {1: 0, 2: 1}
        assert 3 not in distances
        assert 4 not in distances

    def test_with_goal(self):
        G = diamond_graph()
        goal = Goal(lambda x: x == 4)
        assert shortest_path_length(G, 1, goal) == 2


class TestShortestPath:
    def test_simple_path(self):
        G = simple_graph()
        assert shortest_path(G, 1, 2) == [1, 2]
        assert shortest_path(G, 1, 3) == [1, 2, 3]

    def test_same_source_and_target(self):
        G = simple_graph()
        assert shortest_path(G, 1, 1) == [1]

    # TODO: None?
    def test_no_path_returns_empty_list(self):
        G = disconnected_graph()
        assert shortest_path(G, 1, 3) == []
        assert shortest_path(G, 1, 4) == []

    def test_diamond_graph_returns_one_path(self):
        G = diamond_graph()
        path = shortest_path(G, 1, 4)
        # Should return one of the two valid paths
        assert len(path) == 3
        assert path[0] == 1
        assert path[-1] == 4
        assert path in ([1, 2, 4], [1, 3, 4])

    def test_weighted_graph_returns_cheapest_path(self):
        G = WeightedGraph()
        path = shortest_path(G, "A", "D", G.weight)
        assert path == ["A", "B", "D"]  # Cost 2, not A->C->D (cost 6)

    def test_with_goal(self):
        G = diamond_graph()
        goal = Goal(lambda x: x == 4)
        path = shortest_path(G, 1, goal)
        assert path[0] == 1
        assert path[-1] == 4


class TestAllShortestPaths:
    def test_simple_path_single_result(self):
        G = simple_graph()
        paths = all_shortest_paths(G, 1, 3)
        assert paths == [[1, 2, 3]]

    def test_diamond_graph_multiple_paths(self):
        G = diamond_graph()
        paths = all_shortest_paths(G, 1, 4)
        assert len(paths) == 2
        assert [1, 2, 4] in paths
        assert [1, 3, 4] in paths

    def test_same_source_and_target(self):
        G = simple_graph()
        paths = all_shortest_paths(G, 1, 1)
        assert paths == [[1]]

    def test_weighted_graph_single_cheapest_path(self):
        G = WeightedGraph()
        paths = all_shortest_paths(G, "A", "D", G.weight)
        assert paths == [["A", "B", "D"]]

    def test_multiple_equal_weight_paths(self):
        G = diamond_graph()
        paths = all_shortest_paths(G, 1, 4, weight=lambda a, b: 1)
        assert len(paths) == 2
        assert [1, 2, 4] in paths
        assert [1, 3, 4] in paths

    def test_with_goal(self):
        G = diamond_graph()
        goal = Goal(lambda x: x == 4)
        paths = all_shortest_paths(G, 1, goal)
        assert len(paths) == 2
        assert [1, 2, 4] in paths
        assert [1, 3, 4] in paths


class TestAllShortestPathLengths:
    def test_simple_graph(self):
        G = simple_graph()
        distances = all_shortest_path_lengths(G)
        assert distances == {
            (1, 1): 0,
            (1, 2): 1,
            (1, 3): 2,
            (2, 2): 0,
            (2, 3): 1,
            (3, 3): 0,
        }

    def test_diamond_graph(self):
        G = diamond_graph()
        distances = all_shortest_path_lengths(G)
        assert distances == {
            (1, 1): 0,
            (1, 2): 1,
            (1, 3): 1,
            (1, 4): 2,
            (2, 2): 0,
            (2, 4): 1,
            (3, 3): 0,
            (3, 4): 1,
            (4, 4): 0,
        }

    def test_disconnected_graph(self):
        G = disconnected_graph()
        distances = all_shortest_path_lengths(G)
        assert distances == {
            (1, 1): 0,
            (1, 2): 1,
            (2, 2): 0,
            (3, 3): 0,
            (3, 4): 1,
            (4, 4): 0,
        }
