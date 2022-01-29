import { example, load, solve } from 'lib/advent';

type Contents = {
  count: number;
  color: string;
};

type Rules = {
  [key: string]: Contents[];
};

function parseRules(lines: string[]): Rules {
  const rules = {};
  lines.forEach((line) => {
    const [containerColor, rulesString] = line.split(' bags contain ');
    rules[containerColor] = rulesString
      .split(', ')
      .map((rule) => {
        const match = rule.match(/^(?<count>\d+) (?<color>.*) bag/);
        if (!match) return null;
        return {
          count: Number(match.groups.count),
          color: match.groups.color,
        };
      })
      .filter(Boolean);
  });
  return rules;
}

function canContain(target: string, container: string, rules: Rules): boolean {
  return !!rules[container].find((rule) => {
    return rule.color === target || canContain(target, rule.color, rules);
  });
}

function whatCanContain(target: string, rules: Rules): string[] {
  return Object.keys(rules).filter((color) => canContain(target, color, rules));
}

function countContainedBags(container: string, rules: Rules): number {
  return rules[container].reduce((acc, rule) => {
    return (
      acc + rule.count + countContainedBags(rule.color, rules) * rule.count
    );
  }, 0);
}

const exampleRules1 = parseRules(load('ex1').lines);
example.equal(4, whatCanContain('shiny gold', exampleRules1).length);
const exampleRules2 = parseRules(load('ex2').lines);
example.equal(32, countContainedBags('shiny gold', exampleRules1));
example.equal(126, countContainedBags('shiny gold', exampleRules2));

const rules = parseRules(load().lines);
export default solve(
  () => whatCanContain('shiny gold', rules).length,
  () => countContainedBags('shiny gold', rules)
).expect(326, 5635);
