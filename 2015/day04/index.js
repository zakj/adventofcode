import crypto from 'crypto';
import {Observable} from 'rx';

const INPUT = 'bgvyzdsv';
const md5 = s => crypto.createHash('md5').update(s).digest('hex');

const indexHash$ = Observable.range(1, Infinity)
  .map(i => ({i, hash: md5(INPUT + i)}))

indexHash$
  .filter(({hash}) => hash.indexOf('00000') === 0)
  .map(({i}) => i)
  .take(1)
  .subscribe(console.log);


indexHash$
  .filter(({hash}) => hash.indexOf('000000') === 0)
  .map(({i}) => i)
  .take(1)
  .subscribe(console.log);
