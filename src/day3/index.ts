import { test, readInput } from "../utils"
import { splitToLines } from "../utils/readInput"

const prepareInput = (rawInput: string) => rawInput

const input = prepareInput(readInput())


const determineMostCommonValueForPosition = (position: number, values: string[], invert: boolean): number => {
  let mostCommon: number = 0
  for (let line of values) {
    if (line != "") {
      const char: string = line.charAt(position)

      if (char === "1" || char === "0") {
        // 1 adds one to the Position
        // 0 removes one from the Position
        // -> Position is Positive at the End means more 1s, Negative means more 0s
        mostCommon += char === "1" ? 1 : -1
      }
    }
  }

  if (!invert) {
    return mostCommon >= 0 ? 1 : 0
  } else {
    return mostCommon >= 0 ? 0 : 1
  }
}

const bitToInt = (bitArray: number[], inverted: boolean) => {
  let value = 0;

  for (let i = bitArray.length; i > 0; i--) {
    if ((bitArray[i - 1] === 1 && !inverted) || (bitArray[i - 1] === 0 && inverted)) {
      value += Math.pow(2, bitArray.length - i)
    }
  }

  return value;
}

const stringBitToInt = (bitArray: string[], inverted: boolean) => {
  return bitToInt(bitArray.map(value => parseInt(value)), inverted);
}

const goA = (input) => {
  const lines = splitToLines(input).map(val => val.trimEnd())

  let valuesPerPosition: number[] = []

  for (let i = 0; i < lines[0].length; i++) {
    valuesPerPosition.push(determineMostCommonValueForPosition(i, lines, false))
  }

  let gamma = bitToInt(valuesPerPosition, false);
  let epsilon = bitToInt(valuesPerPosition, true);


  return gamma * epsilon
}

const enum CRITERIA {
  LeastCommon,
  MostCommon
}

const filterByCriteriaUntilOneLeft = (criteria: CRITERIA, values: string[]): string => {

  let currentIndex = 0;

  while (values.length > 1 && currentIndex < values[0].length) {
    let value = determineMostCommonValueForPosition(currentIndex, values, criteria === CRITERIA.LeastCommon)
    values = values.filter(arrayValue => arrayValue.charAt(currentIndex) === value.toString());
    currentIndex++;
  }

  return values[0];
}

const goB = (input) => {
  const lines = splitToLines(input).map(value => value.trimEnd())

  const oxygenRating = stringBitToInt(Array.from(filterByCriteriaUntilOneLeft(CRITERIA.MostCommon, lines)), false);
  const co2Rating = stringBitToInt(Array.from(filterByCriteriaUntilOneLeft(CRITERIA.LeastCommon, lines)), false);

  return oxygenRating * co2Rating;
}

/* Tests */

test(198, goA("00100\n" +
  "11110\n" +
  "10110\n" +
  "10111\n" +
  "10101\n" +
  "01111\n" +
  "00111\n" +
  "11100\n" +
  "10000\n" +
  "11001\n" +
  "00010\n" +
  "01010"))

test(230, goB("00100\n" +
  "11110\n" +
  "10110\n" +
  "10111\n" +
  "10101\n" +
  "01111\n" +
  "00111\n" +
  "11100\n" +
  "10000\n" +
  "11001\n" +
  "00010\n" +
  "01010"))

/* Results */

console.time("Time")
const resultA = goA(input)
const resultB = goB(input)
console.timeEnd("Time")

console.log("Solution to part 1:", resultA)
console.log("Solution to part 2:", resultB)
