import { load, ocr, solve } from 'lib/advent';
import { chunks, Counter } from 'lib/util';

type Layer = number[];
enum Color {
  Black = 0,
  White = 1,
  Transparent = 2,
}
const WIDTH = 25;
const HEIGHT = 6;

function parse(s: string): Layer[] {
  return chunks(s.split('').map(Number), WIDTH * HEIGHT);
}

function flattenLayers(layers: Layer[]): Layer {
  const final: Layer = [];
  const layerSize = layers[0].length;
  for (let i = 0; i < layerSize; ++i) {
    for (let j = 0; j < layers.length; ++j) {
      if (layers[j][i] !== Color.Transparent) {
        final[i] = layers[j][i];
        break;
      }
    }
  }
  return final;
}

function layerString(layer: Layer): string {
  const colorMap = {
    [Color.Black]: ' ',
    [Color.White]: '#',
    [Color.Transparent]: '?',
  };
  return chunks(
    layer.map((x) => colorMap[x as Color]),
    WIDTH
  )
    .map((x) => x.join(''))
    .join('\n');
}

const layers = parse(load().lines[0]);
export default solve(
  () => {
    const counts = layers.map((l) => new Map(new Counter(l).mostCommon));
    const fewestZeros = counts.reduce((min, c) =>
      c.get(0) < min.get(0) ? c : min
    );
    return fewestZeros.get(1) * fewestZeros.get(2);
  },
  () => ocr(layerString(flattenLayers(layers)), '4x6')
).expect(1320, 'RCYKR');
