import { main } from 'lib/advent';
import { iter } from 'lib/iter';
import { md5 } from 'lib/util';

const cache = {
  abc: [
    '00000155f8105dff7f56ee10fa9b9abd',
    '000008f82c5b3924a1ecbebf60344e00',
    '00000f9a2c309875e05c5a5d09f1b8c4',
    '000004e597bd77c5cd2133e9d885fe7e',
    '0000073848c9ff7a27ca2e942ac10a4c',
    '00000a9c311683dbbf122e9611a1c2d4',
    '000003c75169d14fdb31ec1593915cff',
    '0000000ea49fd3fc1b2f10e02d98ee96',
  ],
  cxdnnyjw: [
    '00000fe1e92080b9951b053e70e31fcb',
    '000007c827126c81fa664211693f2540',
    '000007880153f1b804481a39a6d2e86a',
    '00000a6e225253b6aaa8f20efbaad8b5',
    '00000096164643e2e0fbf5a91bfd7f06',
    '00000e77a8b223b2d149990fb634bd74',
    '000006ec13bc03b597beee4fa9352176',
    '00000ee477915a03c15f93ac53769648',
    '000009df43b67685affec89f91b75415',
    '00000426f1cd2f19a38114170b33c5ef',
    '00000986e2cece509b2107f3aeec61a8',
    '00000c3982dbdf86f639179e682d6e06',
    '000007d5ead928e4d0aa9dc516f16f42',
    '00000bbc6c9d9886488cee489ee37a95',
    '000007937c1b2a62ef8d18bab5f52a5d',
    '000002966111d9b5c057ab99802ff414',
    '000007a798e0c990883b19a55ce03092',
    '000003810329edb2a26e9ccf602fd5c1',
    '000009ccf896879e5a7dcb01830713c1',
    '000006a809b3a491b43a2e3b9987dd91',
    '00000718147992fe5089c79072cb3b97',
    '000004ea66bd2ea0b40182aa607f8848',
    '000005829911142c7c1592863f4fd438',
    '0000042318414a15d88da98dd819a220',
    '00000a20471f651893cf571765225c2b',
    '000004cf633c6ad4fbe55232460c4dc6',
    '0000056f9e076bce2a2058086c415d39',
    '000003045ebaa06c1f1cb74f0c56bfec',
    '00000f18089aa0ccc16cc1c851ef2c3c',
    '000004f24f1bb351f29a363bf61963bd',
    '0000019ba65feb3f3b74f37b29ce1481',
  ],
};

function* hashGenerator(id: string) {
  if (cache[id]) {
    for (const hash of cache[id]) yield hash;
  }
  let i = 0;
  let password: string[] = undefined;
  while (true) {
    const hash = md5(id + i++);
    if (hash.slice(0, 5) === '00000') password = yield hash;
    if (i % 50000 === 0 && typeof password !== 'undefined')
      updateProgress(password.join(''));
  }
}

function passwordForId(id: string): string {
  return iter(hashGenerator(id))
    .take(8)
    .map((h) => h[5])
    .toArray()
    .join('');
}

function passwordForIdPos(id: string): string {
  const password = new Array(8).fill('_');
  const foundIndex = new Set<number>();
  const it = hashGenerator(id);
  for (;;) {
    const hash = it.next(password).value;
    const index = Number(`0x${hash[5]}`);
    if (index < 8 && !foundIndex.has(index)) {
      password[index] = hash[6];
      foundIndex.add(index);
      if (foundIndex.size === 8) break;
    }
  }
  return password.join('');
}

function updateProgress(s: string): void {
  if (!process.stdout.isTTY) return;
  const chars = '0123456789abcdef'.split('');
  process.stdout.write(' : ');
  process.stdout.write(
    s.replaceAll('_', () => chars[Math.floor(Math.random() * 16)])
  );
  process.stdout.cursorTo(0);
}

main(
  (s) => passwordForId(s.trim()),
  (s) => passwordForIdPos(s.trim())
);
