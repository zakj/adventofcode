import { answers, example, load } from '../advent';
import { sum } from '../util';

function parse(s: string): number[] {
  return s.split(' ').map(Number);
}

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

const exampleData = parse('2 3 0 3 10 11 12 1 1 0 1 99 2 1 1 2');
example.equal(sum(walk(readNode(exampleData), (n) => n.metadata).flat()), 138);
example.equal(value(readNode(exampleData)), 66);

const data = parse(load(8).raw);
answers.expect(40908, 25910);
answers(
  () => sum(walk(readNode(data), (n) => n.metadata).flat()),
  () => value(readNode(data))
);
