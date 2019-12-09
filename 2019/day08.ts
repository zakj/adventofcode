import { loadDay } from './util';

const data = loadDay(8)[0]
  .split('')
  .map(Number);
const WIDTH = 25;
const HEIGHT = 6;

type Layer = number[];

enum Color {
  Black = 0,
  White = 1,
  Transparent = 2,
}

function chunks<T>(arr: T[], chunkSize: number): T[][] {
  const output = [];
  for (let i = 0; i < arr.length; i += chunkSize) {
    output.push(arr.slice(i, i + chunkSize));
  }
  return output;
}

function loadImageLayers(
  data: number[],
  width: number,
  height: number
): Layer[] {
  return chunks(data, width * height);
}

function findLayerWithFewestZeros(layers: Layer[]) {
  let minLayer = null;
  let minZeroes = Infinity;
  return layers
    .map((layer): [number, Layer] => [layer.filter(x => x === 0).length, layer])
    .sort((a, b) => a[0] - b[0])[0][1];
}

// First layer in front, last layer in back.
function flattenImage(layers: Layer[]): Layer {
  const layer: Layer = [];
  for (let i = 0; i < layers[0].length; ++i) {
    for (let j = 0; j < layers.length; ++j) {
      if (layers[j][i] !== Color.Transparent) {
        layer[i] = layers[j][i];
        break;
      }
    }
  }
  return layer;
}

function layerString(layer: Layer, width: number, height: number): string {
  const colorMap = {
    [Color.Black]: ' ',
    [Color.White]: '#',
    [Color.Transparent]: '?',
  };
  return chunks(
    layer.map(x => colorMap[x as Color]),
    width
  )
    .map(x => x.join(''))
    .join('\n');
}

function part1(data: number[]) {
  const layers = loadImageLayers(data, WIDTH, HEIGHT);
  const fewest = findLayerWithFewestZeros(layers);
  return (
    fewest.filter(x => x === 1).length * fewest.filter(x => x === 2).length
  );
}

function part2(data: number[]) {
  const image = flattenImage(loadImageLayers(data, WIDTH, HEIGHT));
  return layerString(image, WIDTH, HEIGHT);
}

console.log(part1(data));
console.log(part2(data));
