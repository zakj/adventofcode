import { main } from 'lib/advent';
import { lines, sum, zip } from 'lib/util';

type Vector = [x: number, y: number, z: number];
interface Particle {
  id: number;
  position: Vector;
  velocity: Vector;
  acceleration: Vector;
}

function parse(s: string): Particle[] {
  return lines(s).map((line, id) => {
    const [position, velocity, acceleration] = line
      .split(', ')
      .map((x) => x.split(/[<>]/)[1].split(',').map(Number));
    return {
      id,
      position: position as Vector,
      velocity: velocity as Vector,
      acceleration: acceleration as Vector,
    };
  });
}

function findClosest(particles: Particle[]) {
  const dist = (prop: number[]) => sum(prop.map(Math.abs));
  return particles.reduce((min, p) => {
    if (dist(p.acceleration) == dist(min.acceleration)) {
      return dist(p.velocity) < dist(min.velocity) ? p : min;
    }
    return dist(p.acceleration) < dist(min.acceleration) ? p : min;
  });
}

function collide(particles: Particle[]): Particle[] {
  const pmap = new Map<number, Particle>(particles.map((p) => [p.id, p]));
  let runOfNoEliminations = 0;
  while (runOfNoEliminations < 30) {
    const toEliminate = new Set<number>();
    for (const p1 of pmap.values()) {
      const p1p = p1.position;
      for (const p2 of pmap.values()) {
        if (p1.id === p2.id) continue;
        const p2p = p2.position;
        if (p2p.every((x, i) => x === p1p[i])) {
          toEliminate.add(p1.id);
          toEliminate.add(p2.id);
        }
      }
    }
    if (toEliminate.size > 0) {
      for (const id of toEliminate.values()) pmap.delete(id);
      runOfNoEliminations = 0;
    } else {
      runOfNoEliminations++;
    }
    for (const p of pmap.values()) {
      p.velocity = zip(p.velocity, p.acceleration).map(sum) as Vector;
      p.position = zip(p.position, p.velocity).map(sum) as Vector;
    }
  }
  return [...pmap.values()];
}

main(
  (s) => findClosest(parse(s)).id,
  (s) => collide(parse(s)).length
);
