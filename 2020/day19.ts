import { answers, example, load } from './util';

type RuleId = number;
type RuleSequence = (string | RuleId)[];
type Rule = RuleSequence[];
type Rules = Map<RuleId, Rule>;

function parseRules(lines: string[]): Rules {
  return new Map(
    lines.map((line) => {
      const [id, ruleStr] = line.split(': ');
      const rule = ruleStr.split(' | ').map((opt) =>
        opt.split(' ').map((x) => {
          return x.match(/^\d+$/) ? Number(x) : x.replaceAll(/"/g, '');
        })
      );
      return [Number(id), rule];
    })
  );
}

function canStringMatchRules(
  s: string,
  rules: Rules,
  seq: RuleSequence
): boolean {
  if (!s.length || !seq.length) return s.length === seq.length;
  const [head, ...tail] = seq;
  if (typeof head === 'string') {
    if (s[0] !== head) return false;
    return canStringMatchRules(s.slice(1), rules, tail);
  } else {
    return rules
      .get(head)
      .some((x) => canStringMatchRules(s, rules, [].concat(x, tail)));
  }
}

const [exampleInput, exampleMessages] = load(19, 'ex').paragraphs;
const exampleRules = parseRules(exampleInput);
example.equal(
  2,
  exampleMessages.filter((m) => canStringMatchRules(m, exampleRules, [0]))
    .length
);

const [input, messages] = load(19).paragraphs;
const rules = parseRules(input);
answers(
  () => messages.filter((m) => canStringMatchRules(m, rules, [0])).length,
  () => {
    rules.get(8).push([42, 8]);
    rules.get(11).push([42, 11, 31]);
    return messages.filter((m) => canStringMatchRules(m, rules, [0])).length;
  }
);
