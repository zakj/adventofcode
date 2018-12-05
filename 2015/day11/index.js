import {Observable} from 'rx';
import {List, Set} from 'Immutable';

const INPUT = 'hepxcrrq';
const ALPHABET = 'abcdefghijklmnopqrstuvwxyz';

function incrementPass(pass) {
  let last = ALPHABET.indexOf(pass.pop()) + 1;
  if (last >= ALPHABET.length) {
    pass = incrementPass(pass);
  }
  return pass.concat(ALPHABET[last % ALPHABET.length]);
}

List.prototype.pairwise = function () {
  return this.skipLast(1).zip(this.skip(1));
}

const password$ = Observable.generate(
  INPUT.split(''), _ => true, incrementPass, x => x)
  .map(v => v.join(''));

const badLetters = Set('iol');
const validPassword$ = password$
  .filter(p => Set(p).intersect(badLetters).size === 0)
  .filter(p => {
    let match = p.match(/(.)\1/g)
    return match && match.length >= 2
  })
  .filter(p => {
    return List(p).map(c => ALPHABET.indexOf(c))
      .pairwise()
      .map(([a, b]) => a + 1 === b)
      .pairwise()
      .some(v => List(v).every(x => x))
  });

validPassword$
  .take(1)
  .subscribe(console.log);


validPassword$
  .take(1)
  .subscribe(console.log);
