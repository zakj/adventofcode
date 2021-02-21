import { answers, load } from '../advent';

type Graph = Map<string, Node>;
type Node = {
  name: string;
  parent: string;
  children: string[];
};

function parse(lines: string[]): Graph {
  const orbits = new Map<string, string>();
  const orbitedBy = new Map<string, string[]>();
  lines.forEach((line) => {
    const [orbitee, orbiter] = line.split(')');
    orbits.set(orbiter, orbitee);
    orbitedBy.set(orbitee, (orbitedBy.get(orbitee) || []).concat(orbiter));
  });

  const graph = new Map<string, Node>();
  for (const [name, parent] of orbits) {
    graph.set(name, { name, parent, children: orbitedBy.get(name) || [] });
  }
  for (const [name, children] of orbitedBy) {
    if (orbits.has(name)) continue;
    graph.set(name, { name, parent: null, children });
  }
  return graph;
}

function totalOrbits(graph: Graph): number {
  let count = 0;
  for (const node of graph.values()) {
    let cur = node;
    while (cur.parent) {
      count++;
      cur = graph.get(cur.parent);
    }
  }
  return count;
}

function stepsToBalance(graph: Graph, mover: string, target: string): number {
  const start = graph.get(mover).parent;
  const startNode = graph.get(start);
  const q: [string, number][] = [[startNode.parent, 0]];
  const visited = new Set([start]);
  while (q.length) {
    const [name, steps] = q.shift();
    if (name === target) return steps;
    const node = graph.get(name);
    for (const next of [].concat(node.parent || [], node.children)) {
      if (visited.has(next)) continue;
      visited.add(next);
      q.push([next, steps + 1]);
    }
  }
  return -1;
}

const graph = parse(load(6).lines);
answers.expect(241064, 418);
answers(
  () => totalOrbits(graph),
  () => stepsToBalance(graph, 'YOU', 'SAN')
);
