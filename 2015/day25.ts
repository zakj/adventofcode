import { load, solve } from '../advent';

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

const [goalY, goalX] = load().raw.match(/\d+/g).map(Number);
export default solve(() => tableValue(20151125, goalY, goalX)).expect(19980801);
