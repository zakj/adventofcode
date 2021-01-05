import { answers, load } from "./advent";

function combinations(containers: number[], target: number): number[][] {
  const [head, tail] = [containers[0], containers.slice(1)];
  if (tail.length === 0) {
    return head === target ? [[head]] : [];
  }
  else if (head > target) {
    return combinations(tail, target)
  }
  else if (head < target) {
    return [].concat(
      combinations(tail, target - head).map(c => [head].concat(c)),
      combinations(tail, target))
  }
  else {  // head == target
    return [[head]].concat(combinations(tail, target))
  }
}

const containers = load(17).numbers;
answers(
  () => combinations(containers, 150).length,
  () => {
    const combos = combinations(containers, 150);
    const minContainers = Math.min(...combos.map(c => c.length));
    return combos.filter(c => c.length === minContainers).length
  }
)
