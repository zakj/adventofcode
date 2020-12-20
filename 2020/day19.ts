import { answers, cartesianProduct, example, loadDay } from "./util";

type Literal = string;
type RuleId = number;
type RuleSequence = (Literal | RuleId)[];
type Rule = RuleSequence[];
type Rules = Map<RuleId, Rule>

function parseRules(s: string): Rules {
  return new Map(s.split('\n').map(line => {
    const [id, ruleStr] = line.split(': ');
    const optionsStrs = ruleStr.split(' | ')
    return [Number(id), optionsStrs.map(opt => opt.split(' ').map(x => {
      return x.match(/^\d+$/) ? Number(x) : x.replaceAll(/"/g, '');
    }))];
  }));
}

function expandedRule(rules: Rules, id: number, cache: Map<RuleId, string[]>): string[] {
  if (!cache.get(id)) {
    const options = rules.get(id).map(seq => {
      const seqOptions = seq.map(x => {
        if (typeof x === 'number') return expandedRule(rules, x, cache)
        else return [x];
      })
      return cartesianProduct(...seqOptions).map(x => x.join(''))
    })
    cache.set(id, Array.from(new Set(cartesianProduct(...options).flat())))
  }
  return cache.get(id)
}

function part1Valid(rules: Rules, id: number, messages: string[]) {
  const cache = new Map<RuleId, string[]>();
  const expandedRules = new Set(expandedRule(rules, id, cache))
  return messages.filter(m => expandedRules.has(m))
}

const exampleInput = loadDay(19, 'example').split('\n\n');
const exampleRules = parseRules(exampleInput[0]);
const exampleMessages = exampleInput[1].split('\n')
example.equal(2, part1Valid(exampleRules, 0, exampleMessages).length);

const input = loadDay(19).split('\n\n');
const rules = parseRules(input[0])
const messages = input[1].split('\n')
answers(() => part1Valid(rules, 0, messages).length)
