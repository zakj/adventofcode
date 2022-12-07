import { example, load, solve } from 'lib/advent';
import { sum } from 'lib/util';

type Cmd = { cmd: string[]; output: string[][] };

function parse(lines: string[]) {
  const cmds: Cmd[] = [];
  for (let i = 0; i < lines.length; ++i) {
    const line = lines[i];
    if (line[0] === '$') {
      const cmd = line.split(/\s+/).slice(1);
      let j = i + 1;
      const output = [];
      while (lines[j] && lines[j][0] !== '$') {
        output.push(lines[j++].split(/\s+/));
      }
      i = j - 1;
      cmds.push({ cmd, output });
    }
  }
  return cmds;
}

class Dir {
  name = '/';
  parent: Dir | null;
  children: Dir[] = [];
  filesSize = 0;

  get size(): number {
    return this.filesSize + sum(this.children.map((d) => d.size));
  }
}

function tree(cmds: Cmd[]): Dir {
  const root = new Dir();
  let cwd = root;
  for (const { cmd, output } of cmds) {
    // console.log({ cmd, cwd });
    if (cmd[0] === 'cd') {
      if (cmd[1] === '/') continue;
      else if (cmd[1] === '..') {
        cwd = cwd.parent;
      } else {
        const next = cmd[1];
        cwd = cwd.children.find((d) => d.name === next);
      }
    } else if (cmd[0] === 'ls') {
      for (const line of output) {
        // console.log('  ', line);
        if (line[0] === 'dir') {
          const d = new Dir();
          d.parent = cwd;
          d.name = line[1];
          cwd.children.push(d);
        } else {
          const size = line[0];
          cwd.filesSize += Number(size);
        }
      }
    } else {
      throw new Error(cmd.join(' '));
    }
  }
  return root;
}

function walk(d: Dir): Dir[] {
  const rv = [];
  rv.push(d);
  for (const sd of d.children) {
    rv.push(...walk(sd));
  }
  return rv;
}

function part1(root: Dir): number {
  const lt100k = walk(root).filter((d) => d.size <= 100000);
  return sum(lt100k.map((d) => d.size));
}

function part2(root: Dir): number {
  const x = 70_000_000;
  const y = 30_000_000;
  const free = x - root.size;
  const needed = (free - y) * -1;

  return walk(root)
    .sort((a, b) => a.size - b.size)
    .find((d) => d.size >= needed).size;
}

const exampleData = parse(load('ex').lines);
example.equal(95437, part1(tree(exampleData)));
example.equal(24933642, part2(tree(exampleData)));

const data = parse(load().lines);
export default solve(
  () => part1(tree(data)),
  () => part2(tree(data))
).expect(1989474, 1111607);
