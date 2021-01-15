export function range(start: number, stop: number): number[] {
  const step = start < stop ? 1 : -1
  let length = Math.abs(start - stop);
  const xs = [];
  while (length--) {
    xs.push(start);
    start += step;
  }
  return xs;
}
