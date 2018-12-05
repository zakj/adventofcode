import Immutable from 'Immutable';
import {inputFrom} from '..';
import permute from 'heaps-permute';

const INPUT = inputFrom(__dirname);

const RULE_RE = /(\w+) would (gain|lose) (\d+) happiness units by sitting next to (\w+)\./;

const guests = Immutable.Seq(INPUT.trim().split('\n'))
  .map(RULE_RE.exec.bind(RULE_RE))
  .map(([, subject, gainLose, units, object]) => ({subject, object, units: gainLose === 'lose' ? -units : +units}))
  .groupBy(v => v.subject)
  .map(list => list.map(row => [row.object, row.units]))
  .entrySeq()
  .map(([name, scores]) => Immutable.Map({name, scores: Immutable.Map(scores)}))
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


const guestsAndMe = guests
  .map(g => g.setIn(['scores', 'Zak'], 0))
  .push(Immutable.Map({
    name: 'Zak',
    scores: Immutable.Map(guests.map(g => [g.get('name'), 0])),
  }));

// Too many permutations to pass to Math.max via spread.
console.log(
  Immutable.Seq(permute(guestsAndMe.toArray()))
    .map(p => scoreTable(p))
    .max()
);
