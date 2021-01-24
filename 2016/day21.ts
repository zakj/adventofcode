import { answers, example, load } from '../advent';

type Operation = (s: string, reverse?: boolean) => string;

function parse(lines: string[]): Operation[] {
  return lines.map((line) => {
    const words = line.split(' ');
    switch (words.shift()) {
      case 'swap':
        if (words.shift() === 'letter') return swapChr(words[0], words[3]);
        else return swapPos(Number(words[0]), Number(words[3]));
      case 'rotate':
        if (words[0] === 'based') return rotateBasedOn(words[5]);
        else return rotate(words[0] as 'left' | 'right', Number(words[1]));
      case 'reverse':
        return reverseSubStr(Number(words[1]), Number(words[3]));
      case 'move':
        return move(Number(words[1]), Number(words[4]));
    }
  });
}

const swapPos = (x: number, y: number): Operation =>
  function (inp, reverse = false) {
    const s = [...inp];
    [s[x], s[y]] = [s[y], s[x]];
    return s.join('');
  };

const swapChr = (x: string, y: string): Operation =>
  function (inp, reverse = false) {
    const s = [...inp];
    const xi = s.findIndex((c) => c === x);
    const yi = s.findIndex((c) => c === y);
    [s[xi], s[yi]] = [s[yi], s[xi]];
    return s.join('');
  };

const rotate = (dir: 'left' | 'right', steps: number): Operation =>
  function (inp, reverse = false) {
    let s = [...inp];
    if (reverse) dir = dir === 'left' ? 'right' : 'left';
    if (dir === 'left') {
      s = [].concat(s.slice(steps), s.slice(0, steps));
    } else {
      s = [].concat(s.slice(s.length - steps), s.slice(0, s.length - steps));
    }
    return s.join('');
  };

const rotateBasedOn = (x: string): Operation =>
  function (inp, reverse = false) {
    if (!reverse) {
      const xi = [...inp].findIndex((c) => c === x);
      const steps = xi >= 4 ? xi + 2 : xi + 1;
      return rotate('right', steps)(inp);
    } else {
      let steps = 0;
      inp = rotate('left', 1)(inp);
      while (steps < inp.length + 2) {
        const xi = [...inp].findIndex((c) => c === x);
        if ((xi < 4 && steps === xi) || (xi >= 4 && steps === xi + 1)) {
          return inp;
        }
        inp = rotate('left', 1)(inp);
        steps++;
      }
    }
  };

const reverseSubStr = (x: number, y: number): Operation =>
  function (inp, reverse = false) {
    const s = [...inp];
    return []
      .concat(s.slice(0, x), s.slice(x, y + 1).reverse(), s.slice(y + 1))
      .join('');
  };

const move = (x: number, y: number): Operation =>
  function (inp, reverse = false) {
    let s = [...inp];
    if (reverse) [x, y] = [y, x];
    const move = s[x];
    s = [].concat(s.slice(0, x), s.slice(x + 1));
    s = [].concat(s.slice(0, y), move, s.slice(y));
    return s.join('');
  };

function process(instructions: Operation[], s: string, reverse = false) {
  for (let fn of instructions) {
    s = fn(s, reverse);
  }
  return s;
}

const exampleInstructions = parse(load(21, 'ex').lines);
example.equal(process(exampleInstructions, 'abcde'), 'decab');

const instructions = parse(load(21).lines);
answers(
  () => process(instructions, 'abcdefgh'),
  () => process(instructions.reverse(), 'fbgdceah', true)
);
