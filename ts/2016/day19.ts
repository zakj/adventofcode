import { main } from 'lib/advent';
import { allNumbers, range } from 'lib/util';

type Elf = {
  num: number;
  presents: number;
  next?: Elf;
};

function whiteElephantLeftNaive(elfCount: number): number {
  const elves: Elf[] = range(0, elfCount).map((i) => ({
    num: i + 1,
    presents: 1,
  }));
  for (let i = 0; i < elves.length; ++i) {
    elves[i].next = elves[(i + 1) % elves.length];
  }
  let elf = elves[0];
  for (;;) {
    elf.presents += elf.next.presents;
    elf.next = elf.next.next;
    if (elf.next === elf) return elf.num;
    elf = elf.next;
  }
}

// https://en.wikipedia.org/wiki/Josephus_problem
function whiteElephantLeft(elfCount: number): number {
  return Number('0b' + elfCount.toString(2).slice(1) + '1');
}

function whiteElephantAcross(elfCount: number): number {
  const elves: Elf[] = range(0, elfCount).map((i) => ({
    num: i + 1,
    presents: 1,
  }));
  for (let i = 0; i < elves.length; ++i) {
    elves[i].next = elves[(i + 1) % elves.length];
  }
  let elf = elves[0];
  let mid = elves[Math.floor(elves.length / 2) - 1];
  for (let cycle = 0; ; cycle = (cycle + 1) % 2) {
    mid.next = mid.next.next;
    if (cycle === 0) mid = mid.next;
    if (elf.next === elf) return elf.num;
    elf = elf.next;
  }
}

main(
  (s) => whiteElephantLeft(allNumbers(s)[0]),
  (s) => whiteElephantAcross(allNumbers(s)[0])
);
