import { main } from 'lib/advent';
import { lines, pairs, permutations } from 'lib/util';

type Graph = {
  cities: Set<City>;
  distances: Map<string, number>;
};
type City = string;

const pathKey = (...cities: City[]): string => cities.sort().join(',');

function parse(lines: string[]): Graph {
  const re = /(.+) to (.+) = (\d+)/;
  const cities = new Set<City>();
  const distances = lines.reduce((distances, line) => {
    const [city1, city2, length] = line.match(re).slice(1);
    cities.add(city1);
    cities.add(city2);
    distances.set(pathKey(city1, city2), Number(length));
    return distances;
  }, new Map<string, number>());
  return { cities, distances };
}

function allPaths(graph: Graph): number[] {
  return [...permutations([...graph.cities])].map((perm) =>
    pairs(perm).reduce(
      (acc, [a, b]) => acc + graph.distances.get(pathKey(a, b)),
      0
    )
  );
}

main(
  (s) => Math.min(...allPaths(parse(lines(s)))),
  (s) => Math.max(...allPaths(parse(lines(s))))
);
