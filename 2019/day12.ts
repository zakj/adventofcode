import { combinations, gcd, loadDay } from './util';

interface Position {
  x: number;
  y: number;
  z: number;
}

interface Velocity {
  x: number;
  y: number;
  z: number;
}

interface Moon {
  pos: Position;
  vel: Velocity;
}

function positionFromData(data: string[]): Position[] {
  const re = /^<x=(-?\d+), y=(-?\d+), z=(-?\d+)>$/;
  return data.map(s => {
    const match = re.exec(s);
    if (!match) throw new Error('bad input');
    const [x, y, z] = match.slice(1, 4).map(Number);
    return { x, y, z };
  });
}

function step(moons: Moon[]): void {
  for (let [a, b] of combinations(moons)) {
    if (a.pos.x < b.pos.x) {
      a.vel.x++;
      b.vel.x--;
    }
    if (a.pos.x > b.pos.x) {
      a.vel.x--;
      b.vel.x++;
    }
    if (a.pos.y < b.pos.y) {
      a.vel.y++;
      b.vel.y--;
    }
    if (a.pos.y > b.pos.y) {
      a.vel.y--;
      b.vel.y++;
    }
    if (a.pos.z < b.pos.z) {
      a.vel.z++;
      b.vel.z--;
    }
    if (a.pos.z > b.pos.z) {
      a.vel.z--;
      b.vel.z++;
    }
  }

  moons.forEach(({ pos, vel }) => {
    pos.x += vel.x;
    pos.y += vel.y;
    pos.z += vel.z;
  });
}

function moonEnergy({ pos, vel }: Moon): number {
  const pot = Math.abs(pos.x) + Math.abs(pos.y) + Math.abs(pos.z);
  const kin = Math.abs(vel.x) + Math.abs(vel.y) + Math.abs(vel.z);
  return pot * kin;
}

function moonsFromData(data: string[]) {
  return positionFromData(data).map(pos => ({
    pos,
    vel: { x: 0, y: 0, z: 0 },
  }));
}

function part1(data: string[]) {
  const moons = moonsFromData(data);
  for (let i = 0; i < 1000; ++i) step(moons);
  return moons.map(moonEnergy).reduce((sum, x) => x + sum, 0);
}

function part2(data: string[]) {
  const moons = moonsFromData(data);

  const freezeProp = (moons: Moon[], prop: 'x' | 'y' | 'z') =>
    JSON.stringify(moons.map(({ pos, vel }) => [pos[prop], vel[prop]]));

  const start = {
    x: freezeProp(moons, 'x'),
    y: freezeProp(moons, 'y'),
    z: freezeProp(moons, 'z'),
  };
  const cycles = { x: 0, y: 0, z: 0 };
  for (let count = 1; !(cycles.x && cycles.y && cycles.z); ++count) {
    step(moons);
    if (!cycles.x && freezeProp(moons, 'x') === start.x) cycles.x = count;
    if (!cycles.y && freezeProp(moons, 'y') === start.y) cycles.y = count;
    if (!cycles.z && freezeProp(moons, 'z') === start.z) cycles.z = count;
  }

  const tmp = (cycles.x * cycles.y) / gcd(cycles.x, cycles.y);
  return (tmp * cycles.z / gcd(tmp, cycles.z));
}

const data = loadDay(12);
console.log(part1(data))
console.log(part2(data))
