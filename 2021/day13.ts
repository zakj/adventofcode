import { answers, load, ocr } from '../advent';
import { XSet } from '../util';

type Point = { x: number; y: number };
const h = ({ x, y }: Point) => `${x},${y}`;

type FoldDir = 'x' | 'y';
type Dots = XSet<Point>;
type Fold = { dir: 'x' | 'y'; n: number };
type Page = {
  dots: Dots;
  folds: Fold[];
};
const isFoldDir = (s: string): s is FoldDir => ['x', 'y'].includes(s);

function parse(paras: string[][]): Page {
  const dots = new XSet(
    h,
    paras[0].map((line) => {
      const [x, y] = line.split(',', 2).map(Number);
      return { x, y };
    })
  );
  const folds = paras[1].map((line) => {
    const [a, b, c] = line.split(' ', 3);
    const [dir, n] = c.split('=', 2);
    if (!isFoldDir(dir)) throw 'parse error';
    return { dir, n: Number(n) };
  });
  return { dots, folds };
}

function fold(dots: Dots, fold: Fold): Dots {
  return new XSet(
    h,
    [...dots].map((d) => {
      const val = d[fold.dir];
      if (val === fold.n) throw 'invalid fold';
      if (val < fold.n) return d;
      return { ...d, [fold.dir]: fold.n * 2 - val };
    })
  );
}

const page = parse(load(13).paragraphs);
answers.expect(753, 'HZLEHJRK');
answers(
  () => fold(page.dots, page.folds[0]).size,
  () => {
    const dots = page.folds.reduce(fold, page.dots);
    const rows = [];
    // TODO: util function to create this from points
    for (let r = 0; r < 6; ++r) {
      rows.push(new Array(40).fill(' '));
    }
    for (const { x, y } of dots) {
      rows[y][x] = '#';
    }
    return ocr(rows.map((r) => r.join('')).join('\n'), '../figlet-4x6.txt');
  }
);
