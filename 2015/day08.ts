import { load, solve } from 'lib/advent';
import { sum } from 'lib/util';

const words = load().lines;
export default solve(
  () =>
    sum(
      words.map((word) => {
        const quotes = word.match(/\\["\\]/g)?.length || 0;
        const hexChars = word.match(/\\x[0-9a-fA-F]{2}/g)?.length || 0;
        return 2 + quotes + hexChars * 3;
      })
    ),
  () =>
    sum(
      words.map(
        // +2 for the new surrounding quotes.
        (word) => word.replace(/([\\"])/g, '\\$1').length - word.length + 2
      )
    )
).expect(1333, 2046);
