import {Observable} from 'rx';

const INPUT = '3113322113';

function lookAndSay(s) {
  s = s.split('');
  let out = [];
  let lastValue = s.shift();
  let count = 1
  for (let i = 0; i < s.length; ++i) {
    if (s[i] === lastValue) {
      ++count;
    }
    else {
      out.push(count);
      out.push(lastValue);
      count = 1;
      lastValue = s[i];
    }
  }
  out.push(count);
  out.push(lastValue);
  return out.join('');
}

Observable.range(0, 40)
  .reduce(lookAndSay, INPUT)
  .map(v => v.length)
  .subscribe(console.log);


Observable.range(0, 50)
  .reduce(lookAndSay, INPUT)
  .map(v => v.length)
  .subscribe(console.log);
