import { loadDay, roundRobin } from './util';

interface Point {
  x: number;
  y: number;
}

enum MapCell {
  Space = '.',
  Asteroid = '#',
}

const asteroids: Point[] = [];
const data = loadDay(10)
  .map(row => row.split('').map(cell => cell as MapCell))
  .forEach((row, y) =>
    row.forEach((cell, x) => {
      if (cell === MapCell.Asteroid) {
        asteroids.push({ x, y });
      }
    })
  );

function angleBetween(a: Point, b: Point): number {
  const angle = (Math.atan2(a.y - b.y, a.x - b.x) * 180) / Math.PI + 180;
  return (angle + 90) % 360; // zero is up
}

function distanceBetween(a: Point, b: Point): number {
  const deltaX = a.x - b.x;
  const deltaY = a.y - b.y;
  return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
}

function uniqueAnglesFrom(point: Point, points: Point[]): Set<number> {
  return points
    .filter(p => p !== point)
    .reduce(
      (angles, other) => angles.add(angleBetween(point, other)),
      new Set<number>()
    );
}

function mostVisibleAsteroids(asteroids: Point[]): [number, Point] {
  return asteroids
    .map<[number, Point]>(a => [uniqueAnglesFrom(a, asteroids).size, a])
    .sort((a, b) => b[0] - a[0])[0];
}

function asteroidsByAngleAndDistance(asteroid: Point, asteroids: Point[]) {
  const rv: { [key: number]: [number, Point][] } = {};
  asteroids.forEach(other => {
    const angle = angleBetween(asteroid, other);
    rv[angle] = rv[angle] || [];
    rv[angle].push([distanceBetween(asteroid, other), other]);
  });
  Object.values(rv).forEach(v => v.sort((a, b) => a[0] - b[0]));
  return Object.entries(rv)
    .map<[number, Point[]]>(([angle, list]) => [
      Number(angle),
      list.map(x => x[1]),
    ])
    .sort((a, b) => a[0] - b[0]);
}

const [mostVisible, monitoringStation] = mostVisibleAsteroids(asteroids);
console.log(mostVisible, monitoringStation);

console.log(
  roundRobin<Point>(
    asteroidsByAngleAndDistance(monitoringStation, asteroids).map(
      ([angle, points]) => points
    )
  )[199]
);
