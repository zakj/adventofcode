import { load, solve } from 'lib/advent';
import { minDistance } from 'lib/graph';
import { sum } from 'lib/util';

interface Node {
  toString: () => string;
}

// TODO: consider factoring this out, can I use it elsewhere?
class DiGraph<T extends Node> {
  nodes = new Set<T>();
  pred = new Map<T, Set<T>>();
  succ = new Map<T, Set<T>>();

  constructor(edges: [T, T][] = []) {
    for (const edge of edges) {
      this.addEdge(...edge);
    }
  }

  add(n: T): void {
    if (!this.nodes.has(n)) {
      this.pred.set(n, new Set<T>());
      this.succ.set(n, new Set<T>());
      this.nodes.add(n);
    }
  }

  addEdge(from: T, to: T): void {
    this.add(from);
    this.add(to);
    this.pred.get(to).add(from);
    this.succ.get(from).add(to);
  }

  shortestPath(from: T, to: T): number {
    const pred = this.pred;
    const succ = this.succ;
    function edgeWeights(node: T): [T, number][] {
      const oneStep = (node: T): [T, number] => [node, 1];
      return [...pred.get(node), ...succ.get(node)].map(oneStep);
    }
    return minDistance(from, to, (x) => x.toString(), edgeWeights);
  }

  shortestPathUp(from: T, to: T): number {
    const pred = this.pred;
    function edgeWeights(node: T): [T, number][] {
      const oneStep = (node: T): [T, number] => [node, 1];
      return [...pred.get(node)].map(oneStep);
    }
    return minDistance(from, to, (x) => x.toString(), edgeWeights);
  }
}

function parseGraph(lines: string[]): DiGraph<string> {
  return new DiGraph(
    lines.map((line) => line.split(')', 2) as [string, string])
  );
}

const graph = parseGraph(load().lines);
export default solve(
  () => sum([...graph.nodes].map((node) => graph.shortestPathUp(node, 'COM'))),
  () => graph.shortestPath('YOU', 'SAN') - 2
).expect(241064, 418);
