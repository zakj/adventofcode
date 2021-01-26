import { answers, example, load } from '../advent';
import { pairs, permutations } from '../util';

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

const exampleRules = parse(load(9, 'ex').lines);
example.equal(605, Math.min(...allPaths(exampleRules)));
example.equal(982, Math.max(...allPaths(exampleRules)));

const rules = parse(load(9).lines);
answers.expect(141, 736);
answers(
  () => Math.min(...allPaths(rules)),
  () => Math.max(...allPaths(rules))
);
