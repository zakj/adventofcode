export function chunks<T>(arr: T[], chunkSize: number): T[][] {
  const output = [];
  for (let i = 0; i < arr.length; i += chunkSize) {
    output.push(arr.slice(i, i + chunkSize));
  }
  return output;
}

export const sum = (xs: number[]): number => xs.reduce((acc, x) => acc + x, 0);

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

export function zip<T>(...arrs: T[][]): T[][] {
  return range(0, arrs[0].length).map((i) => arrs.map((x) => x[i]));
}
