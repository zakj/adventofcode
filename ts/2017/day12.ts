import { main } from 'lib/advent';
import { lines } from 'lib/util';

type Node = number;
type Nodes = Map<Node, Node[]>;

function parse(s: string): Nodes {
  return new Map<Node, Node[]>(
    lines(s).map((line) => {
      const [node, , ...connections] = line.split(/\s+/);
      return [Number(node), connections.join('').split(',').map(Number)];
    })
  );
}

function group(id: Node, connections: Nodes): Set<Node> {
  const group = new Set<Node>();
  const visited = new Set<Node>();
  const q = [id];
  while (q.length) {
    id = q.shift();
    if (visited.has(id)) continue;
    group.add(id);
    visited.add(id);
    for (const next of connections.get(id)) q.push(next);
  }
  return group;
}

function groups(connections: Nodes): Set<Node>[] {
  const all = [];
  for (const node of connections.keys()) {
    if (all.some((set) => set.has(node))) continue;
    all.push(group(node, connections));
  }
  return all;
}

main(
  (s) => group(0, parse(s)).size,
  (s) => groups(parse(s)).length
);
