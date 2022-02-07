import { example, load, solve } from 'lib/advent';
import { Counter } from 'lib/collections';
import { sum } from 'lib/util';

type Input = {
  name: string;
  weight: number;
  children: Set<string>;
};

function parse(lines: string[]): Input[] {
  const re = /^(?<name>\w+) \((?<weight>\d+)\)(?: -> (?<children>.+))?$/;
  return lines.map((line) => {
    const match = line.match(re);
    return {
      name: match.groups.name,
      weight: Number(match.groups.weight),
      children: new Set(match.groups.children?.split(', ') || []),
    };
  });
}

function rootNodeName(input: Input[]): string {
  return input.find((needle) =>
    input.every((haystack) => !haystack.children.has(needle.name))
  ).name;
}

type Node = {
  weight: number;
  children: string[];
};
type Tree = Map<string, Node>;

function makeTree(input: Input[]): Tree {
  return new Map<string, Node>(
    input.map(({ name, weight, children }) => [
      name,
      { weight, children: [...children] },
    ])
  );
}

function treeWeight(node: Node, tree: Tree): number {
  return (
    node.weight + sum(node.children.map((c) => treeWeight(tree.get(c), tree)))
  );
}

function correctedNodeWeight(node: Node, goal: number, tree: Tree): number {
  const childWeights = new Map(
    node.children.map((c) => [c, treeWeight(tree.get(c), tree)])
  );
  const counts = new Counter([...childWeights.values()]);
  const childGoal = counts.mostCommon[0][0];
  if (counts.length === 1) {
    return goal - childGoal * childWeights.size;
  }
  const nextNode = tree.get(
    [...childWeights.entries()].find(([, weight]) => weight !== childGoal)[0]
  );
  return correctedNodeWeight(nextNode, childGoal, tree);
}

const exampleInput = parse(load('ex').lines);
const exampleTree = makeTree(exampleInput);
const exampleRootName = rootNodeName(exampleInput);
example.equal(exampleRootName, 'tknk');
const exampleRootNode = exampleTree.get(exampleRootName);
example.equal(correctedNodeWeight(exampleRootNode, 0, exampleTree), 60);

const input = parse(load().lines);
export default solve(
  () => rootNodeName(input),
  () => {
    const tree = makeTree(input);
    return correctedNodeWeight(tree.get(rootNodeName(input)), 0, tree);
  }
).expect('dgoocsw', 1275);
