import Immutable from 'Immutable';
import {inputFrom} from '..';
import permute from 'heaps-permute';

const INPUT = inputFrom(__dirname);

const RULE_RE = /(\w+) would (gain|lose) (\d+) happiness units by sitting next to (\w+)\./;

let guests = {};
for (let line of INPUT.trim().split('\n')) {
  const [, subject, gainLose, units, object] = line.match(RULE_RE);
  guests[subject] = guests[subject] || {};
  guests[subject][object] = gainLose === 'lose' ? -units : +units;
}
guests = Immutable.fromJS(guests).entrySeq()
  .map(([name, scores]) => ({name, scores}))
  .toList();

Immutable.List.prototype.pairwise = function () {
  return this.skipLast(1).zip(this.skip(1));
}

function scoreTable(arrangement) {
  return Immutable.fromJS(arrangement.concat(arrangement[0]))  // circular table
    .pairwise()
    .map(([a, b]) => a.getIn(['scores', b.get('name')]) + b.getIn(['scores', a.get('name')]))
    .reduce((acc, v) => acc + v, 0);
}

console.log(Math.max(...permute(guests.toArray()).map(p => scoreTable(p))));


// Ugly ugly hacks, bad data structures, and can't call Math.max with this many
// spread permutations without blowing the stack.
const me = {
  name: 'Zak',
  scores: Immutable.Map(guests.map(({name}) => [name, 0]).fromEntrySeq()),
};
guests = guests
  .map(obj => {
    obj.scores = obj.scores.set('Zak', 0);
    return obj;
  })
  .push(me);

const scores = permute(guests.toArray()).map(p => scoreTable(p));
let max = 0;
for (let score of scores) {
  max = Math.max(max, score);
}
console.log(max);
