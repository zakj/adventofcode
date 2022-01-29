import { load, solve } from 'lib/advent';
import { Counter, partition, range } from 'lib/util';

const data = load().lines;
export default solve(
  () => {
    const counters = range(0, data[0].length).map(
      (i) => new Counter(data.map((line) => line[i]))
    );
    const gamma = parseInt(counters.map((c) => c.mostCommon[0][0]).join(''), 2);
    const epsilon = gamma ^ (Math.pow(2, counters.length) - 1);
    return gamma * epsilon;
  },
  () => {
    let genRatings = data.slice();
    let scrRatings = data.slice();
    const ratingLength = data[0].length;

    for (let i = 0; i < ratingLength; ++i) {
      if (genRatings.length > 1) {
        const [ones, zeros] = partition((line) => line[i] === '1', genRatings);
        genRatings = ones.length >= zeros.length ? ones : zeros;
      }
      if (scrRatings.length > 1) {
        const [ones, zeros] = partition((line) => line[i] === '1', scrRatings);
        scrRatings = zeros.length <= ones.length ? zeros : ones;
      }
    }

    return parseInt(genRatings[0], 2) * parseInt(scrRatings[0], 2);
  }
).expect(3687446, 4406844);
