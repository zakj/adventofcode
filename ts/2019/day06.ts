import { main } from 'lib/advent';
import { minDistance } from 'lib/graph';
import { lines, sum } from 'lib/util';

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
    const edges = (node: T) => [...pred.get(node), ...succ.get(node)];
    return minDistance(from, (x) => x.toString(), { goal: to, edges });
  }

  shortestPathUp(from: T, to: T): number {
    const pred = this.pred;
    const edges = (node: T) => [...pred.get(node)];
    return minDistance(from, (x) => x.toString(), { goal: to, edges });
  }
}

function parseGraph(lines: string[]): DiGraph<string> {
  return new DiGraph(
    lines.map((line) => line.split(')', 2) as [string, string])
  );
}

main(
  (s) => {
    const graph = parseGraph(lines(s));
    return sum(
      [...graph.nodes].map((node) => graph.shortestPathUp(node, 'COM'))
    );
  },
  (s) => parseGraph(lines(s)).shortestPath('YOU', 'SAN') - 2
);
