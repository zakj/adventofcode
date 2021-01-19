import { answers, example } from './advent';
import { md5 } from './util';

function passwordForId(id: string): string {
  const password = [];
  for (let i = 0; password.length < 8; ++i) {
    const hash = md5(id + i);
    if (hash.slice(0, 5) === '00000') password.push(hash[5]);
  }
  return password.join('');
}

function passwordForIdPos(id: string): string {
  const password = new Array(8).fill('_');
  const set = new Set<number>();
  for (let i = 0; set.size < 8; ++i) {
    const hash = md5(id + i);
    if (i % 50000 === 0) updateProgress(password.join(''));
    if (hash.slice(0, 5) === '00000') {
      const index = Number(`0x${hash[5]}`);
      const value = hash[6];
      if (index < 8 && !set.has(index)) {
        password[index] = value;
        set.add(index);
      }
    }
  }
  updateProgress('');
  return password.join('');
}

function updateProgress(s: string): void {
  const chars = '0123456789abcdef'.split('');
  process.stdout.write(' : ');
  process.stdout.write(
    s.replaceAll('_', () => chars[Math.floor(Math.random() * 16)])
  );
  process.stdout.cursorTo(0);
}

example.equal(passwordForId('abc'), '18f47a30');

answers(
  () => passwordForId('cxdnnyjw'),
  () => passwordForIdPos('cxdnnyjw')
);
