import { main } from 'lib/advent';
import { range } from 'lib/util';

class Node<T> {
  value: T;
  next: Node<T>;

  constructor(value: T) {
    this.value = value;
    this.next = this;
  }
}

class CircleList<T> {
  private map: Map<T, Node<T>>;

  constructor(head: Node<T>) {
    this.map = new Map();
    this.map.set(head.value, head);
  }

  popAfter(node: Node<T>): Node<T> {
    const removedNode = node.next;
    node.next = removedNode.next;
    this.map.delete(removedNode.value);
    return removedNode;
  }

  pushAfter(node: Node<T>, newNode: Node<T>): void {
    const next = node.next;
    node.next = newNode;
    newNode.next = next;
    this.map.set(newNode.value, newNode);
  }

  find(value: T): Node<T> {
    return this.map.get(value);
  }

  toArray(from: Node<T>): T[] {
    let node = from;
    const out = [];
    do {
      out.push(node.value);
      node = node.next;
    } while (node !== from);
    return out;
  }
}

function playCups(cups: number[], rounds: number): CircleList<number> {
  const maxVal = cups.reduce((a, b) => Math.max(a, b));
  const [first, ...rest] = cups;
  const head = new Node(first);
  const list = new CircleList(head);
  let cur = head;
  rest.forEach((value) => {
    list.pushAfter(cur, new Node(value));
    cur = cur.next;
  });

  cur = head;
  for (let i = 0; i < rounds; ++i) {
    const pickup = [list.popAfter(cur), list.popAfter(cur), list.popAfter(cur)];
    let destVal = cur.value - 1;
    let destNode = null;
    while (!destNode) {
      destNode = list.find(destVal);
      destVal--;
      if (destVal < 1) destVal = maxVal;
    }
    while (pickup.length) list.pushAfter(destNode, pickup.pop());
    cur = cur.next;
  }
  return list;
}

function part1(cups: number[], rounds: number): string {
  const list = playCups(cups, rounds);
  const one = list.find(1);
  return list.toArray(one).slice(1).join('');
}

function part2(cups: number[], rounds: number): number {
  const maxVal = Math.max(...cups);
  const extendedCups = [].concat(cups, range(maxVal + 1, 1_000_001));
  const list = playCups(extendedCups, rounds);
  const one = list.find(1);
  return one.next.value * one.next.next.value;
}

main(
  (s) => part1(s.trim().split('').map(Number), 100),
  (s) => part2(s.trim().split('').map(Number), 10000000)
);
