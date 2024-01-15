import { main } from 'lib/advent';
import { lines } from 'lib/util';

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

main(
  (s) => whatCanContain('shiny gold', parseRules(lines(s))).length,
  (s) => countContainedBags('shiny gold', parseRules(lines(s)))
);
