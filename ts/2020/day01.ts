import { main } from 'lib/advent';
import { allNumbers, product } from 'lib/util';

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

main(
  (s) => product(find2ElementsWithSum(2020, allNumbers(s))),
  (s) => product(find3ElementsWithSum(2020, allNumbers(s)))
);
