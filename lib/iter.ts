import util from 'util';

class Iter<T> implements Iterable<T> {
  constructor(iterable: Iterable<T> | (() => Iterator<T>)) {
    const iterator =
      iterable instanceof Function
        ? iterable
        : iterable[Symbol.iterator].bind(iterable);
    this[Symbol.iterator] = iterator;
  }

  [Symbol.iterator](): Iterator<T> {
    throw new Error('Method not implemented.');
  }

  [util.inspect.custom](depth, options) {
    const isBig = this.skip(1000).take(1).size;
    return (
      `Iter(${isBig ? '1000+' : this.size}) ` +
      util.inspect(
        this.take(100)
          .toArray()
          // @ts-ignore TODO
          .concat(isBig || this.size > 100 ? ['...'] : []),
        options.showHidden,
        depth,
        options.colors
      )
    );
  }

  // Chainable methods (returning Iter<T>):

  aperture<N extends number>(windowSize: N): Iter<TupleOf<T, N>> {
    const iter = this;
    return new Iter(function* aperture() {
      const buffer: T[] = [];
      const it = iter[Symbol.iterator]();
      while (buffer.length < windowSize) {
        const { value, done } = it.next();
        if (done) return;
        else buffer.push(value);
      }
      while (true) {
        yield buffer as TupleOf<T, N>;
        const { value, done } = it.next();
        if (done) break;
        buffer.shift();
        buffer.push(value);
      }
    });
  }

  // TODO: accept Iterable<U> where U extends T
  concat(...iters: Iterable<T>[]): Iter<T> {
    return concat(this, ...iters);
  }

  filter(predicate: (value: T) => boolean): Iter<T>;
  filter<U extends T>(predicate: (value: T) => value is U): Iter<U>;
  filter(predicate: (value: T) => boolean): Iter<T> {
    const iter = this;
    return new Iter(function* filter() {
      for (const item of iter) if (predicate(item)) yield item;
    });
  }

  // XXX Can TS ensure that this is only available when T extends Iterable?
  flat<Inner>(): T extends Iterable<infer Inner> ? Iter<Inner> : Iter<T> {
    const iter = this;
    function isIterable(value: unknown): value is Iterable<Inner> {
      return typeof value[Symbol.iterator] === 'function';
    }
    // @ts-ignore XXX this works, but how to tell TS about it?
    return new Iter(function* () {
      for (const item of iter) {
        if (isIterable(item)) yield* item;
        else yield item;
      }
    });
  }

  forEach(fn: (value: T, i: number) => any): Iter<T> {
    let i = 0;
    for (const item of this) fn(item, i++);
    return this;
  }

  map<U>(fn: (value: T, i: number) => U): Iter<U> {
    const iter = this;
    return new Iter(function* map() {
      let i = 0;
      for (const item of iter) yield fn(item, i++);
    });
  }

  partition<U extends T>(
    predicate: (value: T, i: number) => value is U
  ): [Iter<U>, Iter<Exclude<T, U>>];
  partition(predicate: (value: T, i: number) => boolean): [Iter<T>, Iter<T>];
  partition(predicate: (value: T, i: number) => boolean): [Iter<T>, Iter<T>] {
    const a = [];
    const b = [];
    let i = 0;
    for (const item of this) {
      if (predicate(item, i++)) a.push(item);
      else b.push(item);
    }
    return [new Iter(a), new Iter(b)];
  }

  pluck<K extends keyof T>(attr: K): Iter<T[K]> {
    return this.map((v) => v[attr]);
  }

  scan<Acc>(fn: (acc: Acc, value: T) => Acc, initial: Acc): Iter<Acc> {
    const iter = this;
    return new Iter(function* scan() {
      yield initial;
      let last = initial;
      for (const item of iter) {
        last = fn(last, item);
        yield last;
      }
    });
  }

  skip(n: number): Iter<T> {
    const iter = this;
    return new Iter(function* skip() {
      let i = 0;
      for (const item of iter) {
        if (++i > n) yield item;
      }
    });
  }

  splitEvery<N extends number>(n: N): Iter<TupleOf<T, N>> {
    const iter = this;
    return new Iter(function* splitEvery(): Generator<TupleOf<T, N>> {
      const it = iter[Symbol.iterator]();
      let buffer: T[] = [];
      let value: T;
      let done = false;
      while (!done) {
        ({ value, done } = it.next());
        if (!done) buffer.push(value);
        if (buffer.length === n || (done && buffer.length)) {
          yield buffer as TupleOf<T, N>;
          buffer = [];
        }
      }
    });
  }

  take(n: number): Iter<T> {
    const iter = this;
    return new Iter(function* take() {
      let i = 0;
      for (const item of iter) {
        yield item;
        if (++i >= n) return;
      }
    });
  }

  uniq(): Iter<T> {
    const iter = this;
    return new Iter(function* uniq() {
      const seen = new Set<T>();
      for (let item of iter) {
        if (!seen.has(item)) {
          seen.add(item);
          yield item;
        }
      }
    });
  }

  uniqBy<U>(keyFn: (value: T) => U): Iter<T> {
    const iter = this;
    return new Iter(function* uniqBy() {
      const seen = new Set<U>();
      for (let item of iter) {
        const key = keyFn(item);
        if (!seen.has(key)) {
          seen.add(key);
          yield item;
        }
      }
    });
  }

  // Methods that end the chain (returning a non-Iter value):

  every(predicate: (value: T) => boolean): boolean {
    const it = this[Symbol.iterator]();
    while (true) {
      const { value, done } = it.next();
      if (done) return true;
      if (!predicate(value)) return false;
    }
  }

  find(predicate: (value: T) => boolean): T {
    for (const item of this) if (predicate(item)) return item;
  }

  findIndex(predicate: (value: T) => boolean): number {
    let i = 0;
    for (const item of this) {
      if (predicate(item)) return i;
      ++i;
    }
  }

  last(): T {
    let item: T;
    for (item of this);
    return item;
  }

  max(): number {
    // XXX how to make this type safe?
    return (this as unknown as Iter<number>).reduce((max, x) =>
      x < max ? max : x
    );
  }

  reduce(fn: (acc: T, value: T) => T): T;
  reduce<Acc>(fn: (acc: Acc, value: T) => Acc, initial: Acc): Acc;
  reduce<Acc>(
    fn: (acc: Acc | T, value: T) => Acc | T,
    initial?: Acc | T
  ): Acc | T {
    // XXX better way to type this?
    if (arguments.length === 1)
      return [...this].reduce(fn as (acc: T, value: T) => T);
    return [...this].reduce(fn, initial);
  }

  // XXX how to handle infinite iterables?
  get size(): number {
    return [...this].length;
  }

  some(predicate: (value: T) => boolean): boolean {
    const it = this[Symbol.iterator]();
    while (true) {
      const { value, done } = it.next();
      if (done) return false;
      if (predicate(value)) return true;
    }
  }

  sum(): number {
    // XXX how to make this type safe?
    return (this as unknown as Iter<number>).reduce((acc, x) => acc + x);
  }

  toArray() {
    return [...this];
  }
}

// From https://github.com/Microsoft/TypeScript/issues/26223#issuecomment-674500430
type TupleOf<T, N extends number> = N extends N
  ? number extends N
    ? T[]
    : _TupleOf<T, N, []>
  : never;
type _TupleOf<T, N extends number, R extends unknown[]> = R['length'] extends N
  ? R
  : _TupleOf<T, N, [T, ...R]>;

export function concat<T>(...iters: Iterable<T>[]): Iter<T> {
  return new Iter(function* concat() {
    for (let iter of iters) yield* iter;
  });
}

export function range(end: number, step?: number): Iter<number>;
export function range(
  start: number,
  end?: number,
  step: number = 1
): Iter<number> {
  if (typeof end === 'undefined') {
    end = start;
    start = 0;
  }
  step *= Math.sign(end - start) === Math.sign(step) ? 1 : -1;
  return new Iter(function* range() {
    for (let i = start; step > 0 ? i < end : i > end; i += step) yield i;
  });
}

// Expose a consistent interface that doesn't depend on class-based implementation.
interface IterType<T> extends Iter<T> {}
export { IterType as Iter };
export const iter = <T>(iterable: Iterable<T>): Iter<T> => new Iter(iterable);
