const fs = require('fs');
const { resolve } = require('path');


function* combinations(arr) {
  for (let i = 0; i < arr.length; ++i) {
    for (let j = i + 1; j < arr.length; ++j) {
      yield [arr[i], arr[j]];
    }
  }
}


function frequencyMap(arr) {
  return arr.reduce((acc, x) => {
    if (acc.hasOwnProperty(x)) acc[x]++;
    else acc[x] = 1;
    return acc;
  }, {});
}


function hammingDistance(a, b) {
  if (a.length !== b.length) throw 'lengths differ';
  let distance = 0;
  zip(a.split(''), b.split('')).forEach(([la, lb]) => distance += la === lb ? 0 : 1);
  return distance;
}


function loadDay(n) {
  const paddedDay = ('0' + n).slice(-2);
  const path = resolve(__dirname, 'input', `day${paddedDay}.txt`);
  return fs.readFileSync(path).toString().trim().split('\n');
}


function mostCommon(arr) {
  if (!arr.length) return {key: null, count: 0};
  const rv = Object.entries(frequencyMap(arr)).sort((a, b) => a[1] - b[1]).slice(-1)[0];
  return {key: rv[0], count: rv[1]};
}


function zip(a, b) {
  return a.map((la, i) => [la, b[i]]);
}


module.exports = {
  combinations,
  frequencyMap,
  hammingDistance,
  loadDay,
  mostCommon,
  zip,
};
