import { example, load, solve } from 'lib/advent';

type Node = number;
type Nodes = Map<Node, Node[]>;

function parse(lines: string[]): Nodes {
  return new Map<Node, Node[]>(
    lines.map((line) => {
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

const exampleConnections = parse(load('ex').lines);
example.equal(group(0, exampleConnections).size, 6);
example.equal(groups(exampleConnections).length, 2);

const connections = parse(load().lines);
export default solve(
  () => group(0, connections).size,
  () => groups(connections).length
).expect(145, 207);
