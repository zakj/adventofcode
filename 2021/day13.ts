import { answers, load } from '../advent';
import { XSet } from '../util';

type Point = { x: number; y: number };
const h = ({ x, y }: Point) => `${x},${y}`;

function parse(paras: string[][]) {
  const dots = paras[0].map((line) => {
    const [x, y] = line.split(',', 2).map(Number);
    return { x, y };
  });
  const folds = paras[1].map((line) => {
    const [a, b, c] = line.split(' ', 3);
    const [dir, n] = c.split('=', 2);
    return { dir, n: Number(n) };
  });
  return { dots, folds };
}

function p1(page) {
  const dots = new XSet<Point>(h, page.dots);
  const fold = page.folds[0];
  if (fold.dir === 'y') {
    const af = [...dots].map(({ x, y }) => {
      if (y === fold.n) throw 'lies!';
      if (y < fold.n) return { x, y };
      return { x, y: fold.n * 2 - y };
    });
    return new XSet(h, af).size;
  }

  if (fold.dir === 'x') {
    const af = [...dots].map(({ x, y }) => {
      if (x === fold.n) throw 'lies!';
      if (x < fold.n) return { x, y };
      return { x: fold.n * 2 - x, y };
    });
    return new XSet(h, af).size;
  }
}

function p2(page) {
  let dots = new XSet<Point>(h, page.dots);
  for (const fold of page.folds) {
    if (fold.dir === 'y') {
      const af = [...dots].map(({ x, y }) => {
        if (y === fold.n) throw 'lies!';
        if (y < fold.n) return { x, y };
        return { x, y: fold.n * 2 - y };
      });
      dots = new XSet(h, af);
    }

    if (fold.dir === 'x') {
      const af = [...dots].map(({ x, y }) => {
        if (x === fold.n) throw 'lies!';
        if (x < fold.n) return { x, y };
        return { x: fold.n * 2 - x, y };
      });
      dots = new XSet(h, af);
    }
  }

  return dots;
}

const page = parse(load(13).paragraphs);
answers.expect(753, 'HZLEHJRK');
answers(
  () => p1(page),
  () => {
    const dots = p2(page);
    console.log(dots);
    const rows = [];
    for (let r = 0; r < 6; ++r) {
      rows.push(new Array(40).fill(' '));
    }
    for (const { x, y } of dots) {
      rows[y][x] = '#';
    }
    console.log(rows.map((r) => r.join('')).join('\n'));
  }
);
