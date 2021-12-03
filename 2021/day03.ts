import { answers, load } from '../advent';
import { Counter, range } from '../util';

function countCharAtPos(lines: string[], i: number, c: string): number {
  return lines.filter((line) => line[i] === c).length;
}

const data = load(3).lines;
answers.expect(3687446, 4406844);
answers(
  () => {
    const counters = range(0, data[0].length).map(
      (i) => new Counter(data.map((line) => line[i]))
    );
    const gamma = parseInt(counters.map((c) => c.mostCommon[0][0]).join(''), 2);
    const epsilon = gamma ^ (Math.pow(2, counters.length) - 1);
    return gamma * epsilon;
  },
  () => {
    let generatorRatings = data.slice();
    let scrubberRatings = data.slice();
    let genRe = '^';
    let scrRe = '^';
    const ratingLength = data[0].length;

    for (let i = 0; i < ratingLength; ++i) {
      if (generatorRatings.length > 1) {
        const genCount = countCharAtPos(generatorRatings, i, '1');
        genRe += genCount >= generatorRatings.length / 2 ? 1 : 0;
        generatorRatings = generatorRatings.filter((l) => l.match(genRe));
      }
      if (scrubberRatings.length > 1) {
        const scrCount = countCharAtPos(scrubberRatings, i, '0');
        scrRe += scrCount <= scrubberRatings.length / 2 ? 0 : 1;
        scrubberRatings = scrubberRatings.filter((l) => l.match(scrRe));
      }
    }

    return parseInt(generatorRatings[0], 2) * parseInt(scrubberRatings[0], 2);
  }
);
