import { main } from 'lib/advent';
import { allNumbers, sum } from 'lib/util';

type Node = {
  children: Node[];
  metadata: number[];
  length: number;
};

function readNode(xs: number[]): Node {
  const [childCount, metaCount] = xs.slice(0, 2);
  let ptr = 2;

  const children = [];
  for (let i = 0; i < childCount; ++i) {
    const child = readNode(xs.slice(ptr));
    ptr += child.length;
    children.push(child);
  }

  const metadata = xs.slice(ptr, ptr + metaCount);
  ptr += metaCount;
  return { children, metadata, length: ptr };
}

function walk<T>(node: Node, fn: (node: Node) => T): T[] {
  return [fn(node)].concat(...node.children.map((n) => walk(n, fn)));
}

function value(node: Node): number {
  if (node.children.length === 0) {
    return sum(node.metadata);
  } else {
    return sum(
      node.metadata.map((i) =>
        i <= node.children.length ? value(node.children[i - 1]) : 0
      )
    );
  }
}

main(
  (s) => sum(walk(readNode(allNumbers(s)), (n) => n.metadata).flat()),
  (s) => value(readNode(allNumbers(s)))
);
