import { example, load, solve } from 'lib/advent';
import { DefaultDict } from 'lib/util';

type Step = string;
type Requirement = {
  step: Step;
  before: Step;
};
type Prereqs = Map<Step, Set<Step>>;
type Worker = {
  step: Step;
  endTime: number;
};

function parse(lines: string[]): Requirement[] {
  return lines.map((line) => {
    const words = line.split(' ');
    return { step: words[1], before: words[7] };
  });
}

function constructPrereqs(reqs: Requirement[]): Prereqs {
  const steps = new Set<Step>();
  const prereqs = new DefaultDict<Step, Set<Step>>(() => new Set());
  for (const req of reqs) {
    steps.add(req.step);
    steps.add(req.before);
    prereqs.get(req.before).add(req.step);
  }
  const starts = [...steps].filter((s) => !prereqs.has(s));
  for (const step of starts) {
    prereqs.set(step, new Set());
  }
  return prereqs;
}

function nextStep(prereqs: Prereqs): Step | null {
  const stepEntry = [...prereqs.entries()]
    .filter(([step, p]) => p.size === 0)
    .sort()
    .shift();
  return stepEntry ? stepEntry[0] : null;
}

function order(reqs: Requirement[]): string {
  const prereqs = constructPrereqs(reqs);
  const output = [];
  while (prereqs.size) {
    const step = nextStep(prereqs);
    output.push(step);
    prereqs.delete(step);
    for (const s of prereqs.values()) {
      s.delete(step);
    }
  }
  return output.join('');
}

function workTime(step: Step, extraTime: number) {
  const base = 'A'.charCodeAt(0);
  return step.charCodeAt(0) - base + extraTime + 1;
}

function duration(
  reqs: Requirement[],
  workerCount: number,
  extraTime: number
): number {
  const prereqs = constructPrereqs(reqs);
  let time = 0;
  const workers: Worker[] = [];
  while (prereqs.size) {
    workers.forEach((w, i) => {
      if (time >= w.endTime) {
        for (const s of prereqs.values()) {
          s.delete(w.step);
        }
        workers.splice(i, 1);
      }
    });

    let step: Step;
    while (workers.length < workerCount && (step = nextStep(prereqs))) {
      prereqs.delete(step);
      workers.push({ step, endTime: time + workTime(step, extraTime) });
    }
    ++time;
  }
  return Math.max(...workers.map((w) => w.endTime));
}

const exampleReqs = parse(load('ex').lines);
example.equal(order(exampleReqs), 'CABDFE');
example.equal(duration(exampleReqs, 2, 0), 15);

const reqs = parse(load().lines);
export default solve(
  () => order(reqs),
  () => duration(reqs, 5, 60)
).expect('BDHNEGOLQASVWYPXUMZJIKRTFC', 1107);
