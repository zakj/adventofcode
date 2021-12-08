import { answers, example, load } from '../advent';
import { XSet } from '../util';

function parse(lines: string[]) {
  return lines.map((line) => {
    const [input, output] = line.split(' | ');
    return { input: input.split(' '), output: output.split(' ') };
  });
}

const MAP = {
  0: 'abcefg',
  1: 'cf',
  2: 'acdeg',
  3: 'acdfg',
  4: 'bcdf',
  5: 'abdfg',
  6: 'abdefg',
  7: 'acf',
  8: 'abcdefg',
  9: 'abcdfg',
};
const REVMAP = new Map(Object.entries(MAP).map(([k, v]) => [v, k]));

function mess(data: { input: string[]; output: string[] }[]) {
  // sum of all output digits
  let total = 0;
  for (const line of data) {
    const unknowns = [...line.input, ...line.output].map(
      (x) => new XSet((h) => h, x)
    );
    const mapping = new Map<string, string>();
    const possible = new Map<string, XSet<string>>(
      'abcdefg'.split('').map((i) => [i, new XSet((h) => h, 'abcdefg')])
    );

    const mappings = new Array(10);
    const cmp = (s: XSet<string>, d: number) => s.intersect(mappings[d]).size;
    mappings[1] = unknowns.find((s) => s.size === MAP[1].length);
    mappings[4] = unknowns.find((s) => s.size === MAP[4].length);
    mappings[7] = unknowns.find((s) => s.size === MAP[7].length);
    mappings[8] = unknowns.find((s) => s.size === MAP[8].length);

    mappings[0] = unknowns.find(
      (s) => s.size === MAP[6].length && cmp(s, 4) === 3 && cmp(s, 1) === 2
    );
    mappings[6] = unknowns.find(
      (s) => s.size === MAP[6].length && cmp(s, 4) === 3 && cmp(s, 1) == 1
    );
    mappings[9] = unknowns.find(
      (s) => s.size === MAP[9].length && cmp(s, 4) === 4 && cmp(s, 1) === 2
    );

    mappings[2] = unknowns.find(
      (s) => s.size === MAP[2].length && cmp(s, 6) === 4 && cmp(s, 1) === 1
    );
    mappings[3] = unknowns.find(
      (s) => s.size === MAP[3].length && cmp(s, 6) === 4 && cmp(s, 1) === 2
    );
    mappings[5] = unknowns.find(
      (s) => s.size === MAP[5].length && cmp(s, 6) === 5 && cmp(s, 1) === 1
    );
    // console.log(mappings);
    // console.log('###');

    const x = Number(
      line.output
        .map((x) => {
          const s = new XSet((h) => h, x);
          return mappings.findIndex(
            (ms) => ms.size === s.size && ms.intersect(s).size === s.size
          );
        })
        .join('')
    );
    if (x === 8384) {
      console.log(line);
      console.log(mappings);
    }
    console.log(x);
    total += x;

    // console.log(possible);
    // for (const x of unknowns) {
    //   [1, 4, 7].forEach((num) => {
    //     if (x.length === MAP[num].length) {
    //       for (const c of x) {
    //         possible.set(
    //           c,
    //           possible.get(c).intersect(new XSet((h) => h, MAP[num]))
    //         );
    //       }

    //       // console.log('found match for', x, num);
    //       // for (let i = 0; i < x.length; ++i) {
    //       //   if (x[i] === 'b') {
    //       //     console.log('HERE', x[i], MAP[num][i]);
    //       //   }
    //       //   if (mapping.has(x[i]) && mapping.get(x[i]) !== MAP[num][i]) {
    //       //     console.log(x);
    //       //     throw 'oops';
    //       //   }
    //       //   mapping.set(x[i], MAP[num][i]);
    //       // }
    //       // console.log({ mapping });
    //     }
    //   });
    // }
    // while (![...possible.values()].every(s => s.size === 1)) {

    // }

    // console.log(possible);
    // const mappedInput = line.input.slice();
    // const xmappig = new XSet((h) => h, mapping.keys());
    // const knowns = [];
    // for (const x of unknowns) {
    //   const xset = new XSet((h) => h, x);
    //   if (xset.size === xset.intersect(xmappig).size) {
    //     console.log('got one');
    //   }
    //   const test = new Array(x.length).fill('.');
    //   for (let i = 0; i < x.length; ++i) {
    //     const c = x[i];
    //     if (mapping.has(c)) {
    //       test[i] = mapping.get(c);
    //     }
    //   }
    //   if (test.includes('.')) throw 'not found';
    //   if (!REVMAP.has(test.join(''))) {
    //     console.log({ mapping, REVMAP, test: test.join(''), x });
    //     throw 'not found';
    //   }
    // }
    // // while (mapping.size < 8) {}
    // const output: number[] = [];
    // total += sum(output);
  }
  return total;
}

const exampleData = parse(load(8, 'ex1').lines);
example.equal(mess(exampleData), 5353);
const exampleData2 = parse(load(8, 'ex2').lines);
example.equal(mess(exampleData2), 61229);

const data = parse(load(8).lines);
answers.expect(479);
answers(
  () => {
    let count = 0;
    for (const line of data) {
      count += line.output.filter((x) =>
        [2, 3, 4, 7].includes(x.length)
      ).length;
    }
    return count;
  },
  // 728591 too low
  () => mess(data)
);
