import { load, solve } from 'lib/advent';
import { sum } from 'lib/util';

const PAIRS = new Map([
  ['(', ')'],
  ['[', ']'],
  ['{', '}'],
  ['<', '>'],
]);

const CORRUPT_SCORE = new Map([
  [')', 3],
  [']', 57],
  ['}', 1197],
  ['>', 25137],
]);

const AUTOCOMPLETE_SCORE = new Map([
  [')', 1],
  [']', 2],
  ['}', 3],
  ['>', 4],
]);

function corruptScore(line: string): number {
  const openChars = [...PAIRS.keys()];
  const stack = [];
  for (const c of line) {
    if (openChars.includes(c)) stack.push(c);
    else if (c != PAIRS.get(stack.pop())) return CORRUPT_SCORE.get(c);
  }
  return 0;
}

function autoCompleteScore(line: string): number {
  const openChars = [...PAIRS.keys()];
  const closeChars = [...PAIRS.values()];
  return line
    .split('')
    .reduce((stack, c) => {
      if (openChars.includes(c)) stack.push(c);
      else if (closeChars.includes(c)) stack.pop();
      return stack;
    }, [])
    .map((c) => PAIRS.get(c))
    .reverse()
    .reduce((score, c) => score * 5 + AUTOCOMPLETE_SCORE.get(c), 0);
}

const lines = load().lines;
export default solve(
  () => sum(lines.map(corruptScore)),
  () => {
    const lineScores = lines
      .filter((line) => corruptScore(line) === 0)
      .map(autoCompleteScore)
      .sort((a, b) => a - b);
    return lineScores[Math.floor(lineScores.length / 2)];
  }
).expect(367059, 1952146692);
