import { answers, example, load } from '../advent';

type Passport = {
  byr?: string;
  iyr?: string;
  eyr?: string;
  hgt?: string;
  hcl?: string;
  ecl?: string;
  pid?: string;
  cid?: string;
};

function parsePassports(passports: string[][]): Passport[] {
  return passports.map((passport) => {
    return passport
      .join(' ')
      .split(/\s+/)
      .reduce((acc, field) => {
        const [key, value] = field.split(':');
        acc[key] = value;
        return acc;
      }, {});
  });
}

function containsRequiredFields(passport: Passport): boolean {
  return Boolean(
    passport.byr &&
      passport.iyr &&
      passport.eyr &&
      passport.hgt &&
      passport.hcl &&
      passport.ecl &&
      passport.pid
  );
}

function isValid(passport: Passport): boolean {
  if (!containsRequiredFields(passport)) return false;

  const byr = Number(passport.byr);
  if (byr < 1920 || byr > 2002) return false;

  const iyr = Number(passport.iyr);
  if (iyr < 2010 || iyr > 2020) return false;

  const eyr = Number(passport.eyr);
  if (eyr < 2020 || eyr > 2030) return false;

  const hgt = passport.hgt.match(/^(?<n>\d+)(?<type>cm|in)$/);
  if (!hgt) return false;
  if (hgt.groups.type === 'cm') {
    const n = Number(hgt.groups.n);
    if (n < 150 || n > 193) return false;
  }
  if (hgt.groups.type === 'in') {
    const n = Number(hgt.groups.n);
    if (n < 59 || n > 76) return false;
  }

  if (!passport.hcl.match(/^#[0-9a-f]{6}$/)) return false;

  if (!['amb', 'blu', 'brn', 'gry', 'grn', 'hzl', 'oth'].includes(passport.ecl))
    return false;

  if (!passport.pid.match(/^\d{9}$/)) return false;

  return true;
}

const exampleData = parsePassports(load(4, 'ex').paragraphs);
example.equal(2, exampleData.filter(containsRequiredFields).length);

const passports = parsePassports(load(4).paragraphs);
answers.expect(228, 175);
answers(
  () => passports.filter(containsRequiredFields).length,
  () => passports.filter(isValid).length
);
