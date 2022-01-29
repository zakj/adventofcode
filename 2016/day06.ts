import { example, load, solve } from '../advent';
import { Counter, last, zip } from '../util';

function errorCorrect(signals: string[]): string {
  return zip(...signals.map((x) => x.split('')))
    .map((column) => new Counter(column).mostCommon[0][0])
    .join('');
}

function errorCorrectLeast(signals: string[]): string {
  return zip(...signals.map((x) => x.split('')))
    .map((column) => last(new Counter(column).mostCommon)[0])
    .join('');
}

const exampleSignals = load('ex').lines;
example.equal(errorCorrect(exampleSignals), 'easter');

const signals = load().lines;
export default solve(
  () => errorCorrect(signals),
  () => errorCorrectLeast(signals)
).expect('qqqluigu', 'lsoypmia');
