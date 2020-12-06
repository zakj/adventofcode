import { example, loadDay } from './util';

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

function parsePassports(s: string): Passport[] {
  return s.split('\n\n').map((passport) => {
    return passport.split(/\s+/).reduce((acc, field) => {
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

const exampleData = parsePassports(
  `
ecl:gry pid:860033327 eyr:2020 hcl:#fffffd
byr:1937 iyr:2017 cid:147 hgt:183cm

iyr:2013 ecl:amb cid:350 eyr:2023 pid:028048884
hcl:#cfa07d byr:1929

hcl:#ae17e1 iyr:2013
eyr:2024
ecl:brn pid:760753108 byr:1931
hgt:179cm

hcl:#cfa07d eyr:2025 pid:166559648
iyr:2011 ecl:brn hgt:59in
`.trim()
);

example.equal(2, exampleData.filter(containsRequiredFields).length);

// { '1': 228, '2': 175 }
const passports = parsePassports(loadDay(4));
console.log({
  1: passports.filter(containsRequiredFields).length,
  2: passports.filter(isValid).length,
});
