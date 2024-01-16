import { main } from 'lib/advent';
import { lines } from 'lib/util';

type RegularNode = { parent?: PairNode; value: number };
type PairNode = { parent?: PairNode; left: Node; right: Node };
type Node = RegularNode | PairNode;

function makeNode(s: string): Node;
function makeNode(value: number): Node;
function makeNode([left, right]: [Node, Node]): Node;
function makeNode(arg: string | number | [Node, Node]): Node {
  if (typeof arg === 'string') {
    const arrToPair = ([left, right]): Node => {
      return makeNode([
        typeof left === 'number' ? makeNode(left) : arrToPair(left),
        typeof right === 'number' ? makeNode(right) : arrToPair(right),
      ]);
    };
    return arrToPair(JSON.parse(arg));
  } else if (typeof arg === 'number') {
    return { value: arg };
  } else {
    const [left, right] = arg;
    const node = { left, right };
    left.parent = right.parent = node;
    return node;
  }
}

function nodeToString(node: Node): string {
  const pairToArr = (p: Node) => {
    if ('value' in p) return p.value;
    return [
      typeof p.left === 'number' ? p.left : pairToArr(p.left),
      typeof p.right === 'number' ? p.right : pairToArr(p.right),
    ];
  };
  return JSON.stringify(pairToArr(node));
}

function inOrder(node: Node): RegularNode[] {
  if ('value' in node) return [node];
  return [...inOrder(node.left), ...inOrder(node.right)];
}

function inOrderPairs(
  node: Node,
  depth = 0
): { node: PairNode; depth: number }[] {
  if ('value' in node) return [];
  if ('value' in node.left && 'value' in node.right) {
    return [{ node, depth }];
  } else {
    return [
      ...inOrderPairs(node.left, depth + 1),
      ...inOrderPairs(node.right, depth + 1),
    ];
  }
}

function findLeft(root: Node, from: PairNode): RegularNode {
  const regularNodes = inOrder(root);
  const i = regularNodes.findIndex((n) => n === from.left) - 1;
  if (i < 0 || i >= regularNodes.length) return null;
  return regularNodes[i];
}

function findRight(root: Node, from: PairNode): RegularNode {
  const regularNodes = inOrder(root);
  const i = regularNodes.findIndex((n) => n === from.right) + 1;
  if (i < 0 || i >= regularNodes.length) return null;
  return regularNodes[i];
}

function replace(node: Node, replaceNode: Node): void {
  const dir = node.parent.left === node ? 'left' : 'right';
  node.parent[dir] = replaceNode;
  replaceNode.parent = node.parent;
}

function explode(root: Node): boolean {
  const pair = inOrderPairs(root)
    .filter(({ depth }) => depth === 4)
    .map(({ node }) => node)
    .shift();
  if (!pair) return false;
  if (!('value' in pair.left && 'value' in pair.right)) throw 'invalid pair';
  const left = findLeft(root, pair);
  if (left) left.value += pair.left.value;
  const right = findRight(root, pair);
  if (right) right.value += pair.right.value;
  replace(pair, makeNode(0));
  return true;
}

function split(root: Node): boolean {
  const node = inOrder(root).find((n) => n.value >= 10);
  if (!node) return false;
  replace(
    node,
    makeNode([
      makeNode(Math.floor(node.value / 2)),
      makeNode(Math.ceil(node.value / 2)),
    ])
  );
  return true;
}

function reduce(root: Node) {
  while (explode(root) || split(root));
  return root;
}

function add(a: Node, b: Node): Node {
  return reduce(makeNode([a, b]));
}

function magnitude(node: Node): number {
  if ('value' in node) return node.value;
  return magnitude(node.left) * 3 + magnitude(node.right) * 2;
}

main(
  (s) => magnitude(lines(s).map(makeNode).reduce(add)),
  (s) => {
    const numbers = lines(s);
    let maxMagnitude = -Infinity;
    for (let i = 0; i < numbers.length; ++i) {
      for (let j = i; j < numbers.length; ++j) {
        maxMagnitude = Math.max(
          maxMagnitude,
          magnitude(reduce(add(makeNode(numbers[i]), makeNode(numbers[j]))))
        );
        maxMagnitude = Math.max(
          maxMagnitude,
          magnitude(reduce(add(makeNode(numbers[j]), makeNode(numbers[i]))))
        );
      }
    }
    return maxMagnitude;
  }
);
