import { main } from 'lib/advent';
import { allNumbers } from 'lib/util';

function tableValue(startVal: number, goalRow: number, goalCol: number) {
  const nextVal = (prev: number): number => (prev * 252533) % 33554393;
  let val = startVal;
  const table = [[val]];
  for (
    let startRow = 1;
    table.length < goalRow || table[goalRow - 1].length < goalCol;
    ++startRow
  ) {
    table.push([]);
    for (let row = startRow; row >= 0; --row) {
      val = nextVal(val);
      table[row].push(val);
    }
  }
  return table[goalRow - 1][goalCol - 1];
}

main((s) => {
  const [goalY, goalX] = allNumbers(s);
  return tableValue(20151125, goalY, goalX);
});
