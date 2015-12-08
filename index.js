import {readFileSync} from 'fs';
import path from 'path';

export const inputFrom = (dir) => {
  return readFileSync(path.join(dir, 'input.txt')).toString();
};
