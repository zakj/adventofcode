import { main } from 'lib/advent';
import { lines, sum } from 'lib/util';

main(
  (s) =>
    sum(
      lines(s).map((word) => {
        const quotes = word.match(/\\["\\]/g)?.length || 0;
        const hexChars = word.match(/\\x[0-9a-fA-F]{2}/g)?.length || 0;
        return 2 + quotes + hexChars * 3;
      })
    ),
  (s) =>
    sum(
      lines(s).map(
        // +2 for the new surrounding quotes.
        (word) => word.replace(/([\\"])/g, '\\$1').length - word.length + 2
      )
    )
);
