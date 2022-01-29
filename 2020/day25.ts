import { example, load, solve } from 'lib/advent';

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
  for (let [loopSize, value] of transformSubjectSearch(INITIAL_SUBJECT)) {
    if (value === pubKey) return loopSize;
  }
}

function encryptionKey(pubKeys: number[]): number {
  const loopSizes = pubKeys.map(findLoopSize);
  return transformSubject(pubKeys[0], loopSizes[1]);
}

const examplePubKeys = [5764801, 17807724];
example.equal(8, findLoopSize(examplePubKeys[0]));
example.equal(11, findLoopSize(examplePubKeys[1]));
example.equal(examplePubKeys[0], transformSubject(7, 8));
example.equal(examplePubKeys[1], transformSubject(7, 11));
example.equal(14897079, encryptionKey(examplePubKeys));

const pubKeys = load().numbers;
export default solve(() => encryptionKey(pubKeys)).expect(4968512);
