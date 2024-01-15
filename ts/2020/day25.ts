import { main } from 'lib/advent';
import { allNumbers } from 'lib/util';

const INITIAL_SUBJECT = 7;

function* transformSubjectSearch(subject: number): Generator<[number, number]> {
  let loopSize = 0;
  let value = 1;
  while (true) {
    loopSize += 1;
    value *= subject;
    value %= 20201227;
    yield [loopSize, value];
  }
}

function transformSubject(subject: number, loopSize: number): number {
  let value = 1;
  for (let i = 1; i <= loopSize; ++i) {
    value *= subject;
    value %= 20201227;
  }
  return value;
}

function findLoopSize(pubKey: number): number {
  for (const [loopSize, value] of transformSubjectSearch(INITIAL_SUBJECT)) {
    if (value === pubKey) return loopSize;
  }
}

function encryptionKey(pubKeys: number[]): number {
  const loopSizes = pubKeys.map(findLoopSize);
  return transformSubject(pubKeys[0], loopSizes[1]);
}

main((s) => encryptionKey(allNumbers(s)));
