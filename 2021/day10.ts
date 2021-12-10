import { answers, load } from '../advent';

// const exampleData = parse(load(10, 'ex').raw);
// example.equal(XXX(exampleData), XXX);

const lines = load(10).lines;
answers.expect(367059);
answers(
  () => {
    let score = 0;
    for (const line of lines) {
      const stack = [];
      let corrupted = false;
      for (const c of line) {
        if ('([{<'.includes(c)) {
          stack.push(c);
        } else {
          const last = stack.pop();
          if (c === ')' && last !== '(') {
            corrupted = true;
            score += 3;
          } else if (c === ']' && last !== '[') {
            corrupted = true;
            score += 57;
          } else if (c === '}' && last !== '{') {
            corrupted = true;
            score += 1197;
          } else if (c === '>' && last !== '<') {
            corrupted = true;
            score += 25137;
          }
        }
      }
    }
    return score;
  },
  () => {
    const incomplete = [];
    for (const line of lines) {
      const stack = [];
      let corrupted = false;
      for (const c of line) {
        if ('([{<'.includes(c)) {
          stack.push(c);
        } else {
          const last = stack.pop();
          if (c === ')' && last !== '(') {
            corrupted = true;
          } else if (c === ']' && last !== '[') {
            corrupted = true;
          } else if (c === '}' && last !== '{') {
            corrupted = true;
          } else if (c === '>' && last !== '<') {
            corrupted = true;
          }
        }
      }
      if (corrupted === false) incomplete.push(line);
    }

    const lineScores = [];
    for (const line of incomplete) {
      const stack = [];
      for (const c of line) {
        if ('([{<'.includes(c)) {
          stack.push(c);
        } else if (')]}>'.includes(c)) {
          stack.pop();
        } else {
          throw 'wat';
        }
      }

      const closing = [];
      while (stack.length) {
        const c = stack.pop();
        if (c === '(') closing.push(')');
        if (c === '{') closing.push('}');
        if (c === '[') closing.push(']');
        if (c === '<') closing.push('>');
      }

      let score = 0;
      let scoreCount = 0;
      for (const c of closing) {
        score *= 5;
        if (c === ')') score += 1;
        if (c === ']') score += 2;
        if (c === '}') score += 3;
        if (c === '>') score += 4;
      }
      lineScores.push(score);
    }
    lineScores.sort((a, b) => a - b);
    return lineScores[Math.floor(lineScores.length / 2)];
  }
);
