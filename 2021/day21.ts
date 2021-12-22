import { answers, load } from '../advent';
import { Counter, range, sum } from '../util';

type Player = {
  pos: number;
  score: number;
};

function parse(lines: string[]): number[] {
  return lines.slice(0, 2).map((line) => Number(line.split(': ')[1]));
}

const wrap = (n: number, at: number): number => ((n - 1) % at) + 1;

const allRolls = range(1, 4).flatMap((a) =>
  range(1, 4).flatMap((b) => range(1, 4).map((c) => sum([a, b, c])))
);
const rollCounts = new Counter(allRolls);

function winsDirac(
  { p1, p2 }: { p1: Player; p2: Player },
  player1Turn = true
): [number, number] {
  if (p1.score >= 21) return [1, 0];
  if (p2.score >= 21) return [0, 1];

  const wins = [];
  const player = player1Turn ? p1 : p2;
  for (const [roll, count] of rollCounts.entries()) {
    const pos = wrap(player.pos + roll, 10);
    const nextPlayer = { pos, score: player.score + pos };
    const next = player1Turn ? { p1: nextPlayer, p2 } : { p1, p2: nextPlayer };
    wins.push(winsDirac(next, !player1Turn).map((v) => v * count));
  }
  return wins.reduce((a, b) => [a[0] + b[0], a[1] + b[1]]);
}

const startPos = parse(load(21).lines);
answers.expect(412344, 214924284932572);
answers(
  () => {
    let p1 = { pos: startPos[0], score: 0 };
    let p2 = { pos: startPos[1], score: 0 };
    let rolls = 0;
    while (true) {
      let roll = wrap(++rolls, 100) + wrap(++rolls, 100) + wrap(++rolls, 100);
      p1.pos = wrap(p1.pos + roll, 10);
      p1.score += wrap(p1.pos, 10);
      if (p1.score >= 1000) break;

      roll = wrap(++rolls, 100) + wrap(++rolls, 100) + wrap(++rolls, 100);
      p2.pos = wrap(p2.pos + roll, 10);
      p2.score += wrap(p2.pos, 10);
      if (p2.score >= 1000) break;
    }
    return rolls * Math.min(p1.score, p2.score);
  },
  () =>
    Math.max(
      ...winsDirac({
        p1: { pos: startPos[0], score: 0 },
        p2: { pos: startPos[1], score: 0 },
      })
    )
);
