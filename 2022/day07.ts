import { example, load, solve } from 'lib/advent';
import { iter } from 'lib/iter';

type Cmd = { cmd: string[]; output: string[][] };

function parse(input: string): Cmd[] {
  return input
    .split('$ ')
    .slice(1)
    .map((chunk) => {
      const [cmd, ...output] = chunk
        .split('\n')
        .map((line) => line.split(/\s+/));
      return { cmd, output };
    });
}

class Dir {
  children: Dir[] = [];
  files: { name: string; size: number }[] = [];

  constructor(public name: string, public parent?: Dir) {}

  get size(): number {
    return iter([...this.files, ...this.children])
      .pluck('size')
      .sum();
  }

  walk(): Dir[] {
    return [this, ...this.children.flatMap((x) => x.walk())];
  }
}

function tree(cmds: Cmd[]): Dir {
  const root = new Dir('/');
  let cwd = root;
  for (const { cmd, output } of cmds) {
    if (cmd[0] === 'cd') {
      const path = cmd[1];
      if (path === '/') cwd = root;
      else if (path === '..') cwd = cwd.parent;
      else cwd = cwd.children.find((d) => d.name === path);
    } else if (cmd[0] === 'ls') {
      const [dirs, files] = iter(output).partition((line) => line[0] === 'dir');
      cwd.children.push(...dirs.map((line) => new Dir(line[1], cwd)));
      cwd.files.push(
        ...files.map((line) => ({ size: Number(line[0]), name: line[1] }))
      );
    }
  }
  return root;
}

function sumOfSmallDirs(root: Dir): number {
  return iter(root.walk())
    .pluck('size')
    .filter((x) => x <= 100000)
    .sum();
}

function toDelete(root: Dir): number {
  const needed = 30_000_000 - (70_000_000 - root.size);
  return iter(root.walk())
    .pluck('size')
    .filter((x) => x >= needed)
    .min();
}

const exampleData = parse(load('ex').raw);
example.equal(95437, sumOfSmallDirs(tree(exampleData)));
example.equal(24933642, toDelete(tree(exampleData)));

const data = parse(load().raw);
export default solve(
  () => sumOfSmallDirs(tree(data)),
  () => toDelete(tree(data))
).expect(1989474, 1111607);
