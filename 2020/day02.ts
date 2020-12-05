import { example, loadDay } from './util';

const exampleData = ['1-3 a: abcde', '1-3 b: cdefg', '2-9 c: ccccccccc'].map(parseData);
example.equal(2, countValidPasswords1(exampleData));
example.equal(1, countValidPasswords2(exampleData));

type Policy = {
  n1: number;
  n2: number;
  chr: string;
};

type PolicyAndPassword = {
  policy: Policy;
  password: string;
};

function parseData(line: string): PolicyAndPassword {
  const [policyStr, password] = line.split(': ');
  const [countStr, chr] = policyStr.split(' ');
  const [n1, n2] = countStr.split('-').map(Number);
  return {
    policy: { n1, n2, chr },
    password,
  };
}

function countOccurrences(needle: string, haystack: string): number {
  const re = new RegExp(needle, 'g');
  return (haystack.match(re) || []).length;
}

function countValidPasswords1(passwords: PolicyAndPassword[]): number {
  return passwords.reduce((count, p) => {
    const occurrences = countOccurrences(p.policy.chr, p.password);
    if (occurrences >= p.policy.n1 && occurrences <= p.policy.n2) ++count;
    return count;
  }, 0);
}

function countValidPasswords2(passwords: PolicyAndPassword[]): number {
  return passwords.reduce((count, p) => {
    const n1Hit = p.password[p.policy.n1 - 1] === p.policy.chr;
    const n2Hit = p.password[p.policy.n2 - 1] === p.policy.chr;
    if (n1Hit !== n2Hit) ++count;
    return count;
  }, 0);
}

const data = loadDay(2).map(parseData);
console.log({
  1: countValidPasswords1(data),
  2: countValidPasswords2(data),
});
