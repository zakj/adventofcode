import { answers, example, load } from '../advent';
import { product } from '../util';

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

example.deepEqual(
  [1721, 299],
  find2ElementsWithSum(2020, [1721, 979, 366, 299, 675, 1456])
);
example.deepEqual(
  [979, 366, 675],
  find3ElementsWithSum(2020, [1721, 979, 366, 299, 675, 1456])
);

const data = load(1).numbers;
answers(
  () => product(find2ElementsWithSum(2020, data)),
  () => product(find3ElementsWithSum(2020, data))
);
