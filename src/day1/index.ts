import { test, readInput } from "../utils"
import { splitToLines } from "../utils/readInput"

const prepareInput = (rawInput: string) => rawInput

const input = prepareInput(readInput())

const goA = (input) => {
  const lines: string[] = splitToLines(input);

  let lastMeasurement: number | undefined = undefined;
  let timesOfIncreases: number = 0;

  for(let line of lines){
    if(line != "") {
      let parsedLine: number = parseInt(line);

      if(lastMeasurement && lastMeasurement < parsedLine){
        timesOfIncreases++;
      }
      lastMeasurement = parsedLine
    }
  }

  return timesOfIncreases
}

const goB = (input) => {
  const lines: string[] = splitToLines(input);

  const parsedLines: number[] = lines.filter(line => line !== "").map(line => parseInt(line));

  let lastMeasurement: number | undefined = undefined;
  let timesOfIncreases: number = 0;

  for(let i = 2; i < parsedLines.length; i++){
    let windowSize = parsedLines[i - 2] + parsedLines[i - 1] + parsedLines[i];

      if(lastMeasurement && lastMeasurement < windowSize){
        timesOfIncreases++;
      }
      lastMeasurement = windowSize
  }

  return timesOfIncreases
}

/* Tests */

// test()

/* Results */

console.time("Time")
const resultA = goA(input)
const resultB = goB(input)
console.timeEnd("Time")

console.log("Solution to part 1:", resultA)
console.log("Solution to part 2:", resultB)
