import {Observable} from 'rx';
import {inputFrom} from '..';

const SECONDS = 2503;

const reindeer$ = Observable.from(inputFrom(__dirname).trim().split('\n'))
  .map(line => line.match(/(\d+)/g))
  .map(matches => matches.map(v => parseInt(v, 10)))
  .map(([speed, on, off]) => ({speed, on, off}))
  .map(reindeer => {
    return Observable.repeat(Observable.concat(
        Observable.repeat(reindeer.speed, reindeer.on),
        Observable.repeat(0, reindeer.off)))
      .concatMap(km => km)
  });

reindeer$
  .concatMap(r => r.take(SECONDS).sum())
  .max()
  .subscribe(console.log);


reindeer$
  .map(r => r.scan((acc, v) => acc + v, 0))
  .toArray()
  .flatMap(arr => Observable.zip(arr))
  .scan((points, distances) => {
    const lead = Math.max(...distances);
    for (let i in distances) {
      if (distances[i] === lead) {
        if (!(i in points)) points[i] = 0;
        ++points[i];
      }
    }
    return points;
  }, {})
  .take(SECONDS).last()
  .map(points => Math.max(...Object.values(points)))
  .subscribe(console.log);
