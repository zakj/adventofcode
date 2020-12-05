import { example, loadDay, product } from './util';

example.deepEqual(
  [1721, 299],
  find2ElementsWithSum(2020, [1721, 979, 366, 299, 675, 1456])
);
example.deepEqual(
  [979, 366, 675],
  find3ElementsWithSum(2020, [1721, 979, 366, 299, 675, 1456])
);

type TwoNumbers = [number, number];
type ThreeNumbers = [number, number, number];

function find2ElementsWithSum(target: number, data: number[]): TwoNumbers {
  let results: TwoNumbers = [0, 0];
  data.forEach((x, i) => {
    data.slice(i + 1).forEach((y) => {
      if (x + y === target) results = [x, y];
    });
  });
  return results;
}

function find3ElementsWithSum(target: number, data: number[]): ThreeNumbers {
  let results: ThreeNumbers = [0, 0, 0];
  data.forEach((x, i) => {
    data.slice(i + 1).forEach((y, j) => {
      data.slice(j + 1).forEach((z) => {
        if (x + y + z === target) results = [x, y, z];
      });
    });
  });
  return results;
}

const data = loadDay(1).map(Number);

console.log({
  1: product(find2ElementsWithSum(2020, data)),
  2: product(find3ElementsWithSum(2020, data)),
});
