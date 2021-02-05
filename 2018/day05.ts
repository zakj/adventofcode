import { answers, load } from '../advent';

function react(polymer: string): string {
  const isPair = (l: string, r: string): boolean =>
    l != r && l.toUpperCase() === r.toUpperCase();
  const buf = [];
  for (const c of polymer) {
    if (buf.length > 0 && isPair(c, buf[buf.length - 1])) buf.pop();
    else buf.push(c);
  }
  return buf.join('');
}

function removingOneUnit(polymer: string): string {
  const units = new Set(polymer.toLowerCase().split(''));
  return [...units.values()]
    .map((c) => react(polymer.replaceAll(new RegExp(c, 'ig'), '')))
    .reduce((min, p) => (p.length < min.length ? p : min));
}

const polymer = load(5).raw.trim();
answers.expect(9808, 6484);
answers(
  () => react(polymer).length,
  () => removingOneUnit(polymer).length
);
