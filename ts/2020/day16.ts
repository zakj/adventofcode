import { main } from 'lib/advent';
import { paragraphs, product, range, sum } from 'lib/util';

type Field = {
  name: string;
  values: Set<number>;
};

type Ticket = number[];

type Data = {
  fields: Field[];
  yourTicket: Ticket;
  otherTickets: Ticket[];
};

function union<T>(a: Set<T>, b: Set<T>): Set<T> {
  const rv = new Set(a);
  b.forEach((x) => rv.add(x));
  return rv;
}

function unionAll<T>(sets: Set<T>[]): Set<T> {
  return sets.reduce((acc, s) => union(acc, s), new Set());
}

function parse(chunks: string[][]): Data {
  const [fieldLines, yourTicketLines, otherTicketsLines] = chunks;
  return {
    fields: fieldLines.map((f) => {
      const [name, rulesStr] = f.split(': ');
      const values = [];
      rulesStr.split(' or ').forEach((rule) => {
        const [start, stop] = rule.split('-').map(Number);
        values.push(...range(start, stop + 1));
      });
      return { name, values: new Set(values) };
    }),
    yourTicket: yourTicketLines[1].split(',').map(Number),
    otherTickets: otherTicketsLines
      .slice(1)
      .map((t) => t.split(',').map(Number)),
  };
}

function invalidValues({ fields, otherTickets: tickets }: Data): number[] {
  const allValidValues = unionAll(fields.map((f) => f.values));
  return [].concat(...tickets).filter((v) => !allValidValues.has(v));
}

function fieldIndexes(data: Data): { [k: string]: number } {
  const fieldNames = data.fields.map((f) => f.name);
  const fieldOptions: { [k: number]: Set<string> } = range(
    0,
    data.fields.length
  ).reduce((acc, i) => ({ [i]: new Set(fieldNames), ...acc }), {});

  // remove field options that don't work based on values
  const allValidValues = unionAll(data.fields.map((f) => f.values));
  data.otherTickets
    .filter((t) => t.every((x) => allValidValues.has(x)))
    .concat([data.yourTicket])
    .forEach((ticket) => {
      ticket.forEach((value, i) => {
        data.fields.forEach((f) => {
          if (!f.values.has(value)) fieldOptions[i].delete(f.name);
        });
      });
    });

  // remove field options that don't work due to conflicts
  const fieldOptionsMap = Object.entries(fieldOptions).map(
    ([index, options]) => ({ index: Number(index), options })
  );

  do {
    fieldOptionsMap
      .filter(({ options }) => options.size === 1)
      .forEach(({ options }) => {
        const toRemove = options.values().next().value;
        fieldOptionsMap
          .filter(({ options }) => options.size > 1)
          .forEach(({ options: subOptions }) => {
            subOptions.delete(toRemove);
          });
      });
  } while (fieldOptionsMap.some(({ options }) => options.size > 1));

  return Object.fromEntries(
    fieldOptionsMap.map(({ index, options }) => {
      const option = options.values().next().value;
      return [option, index];
    })
  );
}

main(
  (s) => sum(invalidValues(parse(paragraphs(s)))),
  (s) => {
    const data = parse(paragraphs(s));
    return product(
      Object.entries(fieldIndexes(data))
        .filter(([field]) => field.match(/^departure/))
        .map(([, index]) => data.yourTicket[index])
    );
  }
);
