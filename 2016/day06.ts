import { answers, example, load } from '../advent';
import { Counter, zip } from '../util';

function errorCorrect(signals: string[]): string {
  return zip(...signals.map((x) => x.split('')))
    .map((column) => new Counter(column).mostCommon[0][0])
    .join('');
}

function errorCorrectLeast(signals: string[]): string {
  return zip(...signals.map((x) => x.split('')))
    .map((column) => {
      const leastCommon = new Counter(column).mostCommon.reverse();
      return leastCommon[0][0];
    })
    .join('');
}

const exampleSignals = load(6, 'ex').lines;
example.equal(errorCorrect(exampleSignals), 'easter');

const signals = load(6).lines;
answers(
  () => errorCorrect(signals),
  () => errorCorrectLeast(signals)
);
