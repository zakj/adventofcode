import { load, ocr, solve } from '../advent';
import { parseSet, PointSet, toAscii } from '../coords';

type FoldDir = 'x' | 'y';
type Fold = { dir: 'x' | 'y'; n: number };
type Page = {
  dots: PointSet;
  folds: Fold[];
};
const isFoldDir = (s: string): s is FoldDir => ['x', 'y'].includes(s);

function parse(paras: string[][]): Page {
  const dots = parseSet(paras[0]);
  const folds = paras[1].map((line) => {
    const [a, b, c] = line.split(' ', 3);
    const [dir, n] = c.split('=', 2);
    if (!isFoldDir(dir)) throw 'parse error';
    return { dir, n: Number(n) };
  });
  return { dots, folds };
}

function fold(dots: PointSet, fold: Fold): PointSet {
  return new PointSet(
    [...dots].map((d) => {
      const val = d[fold.dir];
      if (val === fold.n) throw 'invalid fold';
      if (val < fold.n) return d;
      return { ...d, [fold.dir]: fold.n * 2 - val };
    })
  );
}

const page = parse(load().paragraphs);
export default solve(
  () => fold(page.dots, page.folds[0]).size,
  () => ocr(toAscii(page.folds.reduce(fold, page.dots)), '4x6')
).expect(753, 'HZLEHJRK');
