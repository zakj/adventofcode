export class Counter<T> {
  private counts: Map<T, number>;
  private _mostCommon: [T, number][] = [];

  constructor(xs: T[] = []) {
    this.counts = new Map<T, number>();
    xs.forEach((x) => this.incr(x));
  }

  get length() {
    return this.counts.size;
  }

  incr(x: T, by = 1): void {
    this._mostCommon = [];
    if (!this.counts.has(x)) this.counts.set(x, 0);
    this.counts.set(x, this.counts.get(x) + by);
  }

  entries() {
    return this.counts.entries();
  }

  get mostCommon(): [T, number][] {
    if (this._mostCommon.length === 0)
      this._mostCommon = [...this.entries()].sort(([, a], [, b]) => b - a);
    return this._mostCommon;
  }
}

export class DefaultDict<K, V> extends Map<K, V> {
  constructor(private init: () => V, iterable: Iterable<[K, V]> = []) {
    super(iterable);
  }
  get(key: K): V {
    if (!super.has(key)) super.set(key, this.init());
    return super.get(key);
  }
}

export class MinHeap<T> {
  private arr: { key: number; value: T }[] = [];

  constructor(xs: [key: number, value: T][] = []) {
    for (const x of xs) this.add(...x);
  }

  private parent(i: number): number {
    return Math.floor((i - 1) / 2);
  }
  private left(i: number): number {
    return 2 * i + 1;
  }
  private right(i: number): number {
    return 2 * i + 2;
  }
  private swap(a: number, b: number): void {
    [this.arr[a], this.arr[b]] = [this.arr[b], this.arr[a]];
  }

  add(key: number, value: T): void {
    this.arr.push({ key, value });

    // bubble new item up
    let i = this.arr.length - 1;
    while (i > 0) {
      const p = this.parent(i);
      if (this.arr[p].key < this.arr[i].key) break;
      this.swap(i, p);
      i = p;
    }
  }

  public shift(): T {
    if (this.arr.length === 0) return undefined;
    this.swap(0, this.arr.length - 1);
    const value = this.arr.pop().value;

    // sink previous tail down
    let cur = 0;
    while (this.left(cur) < this.arr.length) {
      let smallerChild = this.left(cur);
      const right = this.right(cur);
      if (
        right < this.arr.length &&
        this.arr[right].key < this.arr[smallerChild].key
      ) {
        smallerChild = right;
      }
      if (this.arr[smallerChild].key > this.arr[cur].key) break;
      this.swap(cur, smallerChild);
      cur = smallerChild;
    }

    return value;
  }

  public get size(): number {
    return this.arr.length;
  }
}
