import { test, readInput } from "../utils"
import { splitToLines } from "../utils/readInput"

const prepareInput = (rawInput: string) => rawInput

const input = prepareInput(readInput())

const enum OPERATION {
  FORWARD,
  UP,
  DOWN
}

const parseOperation = (operation: string): OPERATION => {
  switch (operation){
    case "forward":
      return OPERATION.FORWARD;
    case "down":
      return OPERATION.DOWN;
    case "up":
      return OPERATION.UP;
    default:
      console.error("Operation not known")
  }
}

const goA = (input) => {
  const lines = splitToLines(input);

  let horizontalPosition = 0;
  let depth = 0;

  for(let line of lines) {
    if(line != ""){
      let split = line.split(" ");

      let op: OPERATION = parseOperation(split[0]);

      switch (op) {
        case OPERATION.FORWARD:
          horizontalPosition += parseInt(split[1]);
          break;
        case OPERATION.DOWN:
          depth += parseInt(split[1]);
          break;
        case OPERATION.UP:
          depth -= parseInt(split[1]);
      }
    }
  }

  return horizontalPosition * depth;
}

const goB = (input) => {
  const lines = splitToLines(input);

  let horizontalPosition = 0;
  let depth = 0;
  let aim = 0;

  for(let line of lines) {
    if(line != ""){
      let split = line.split(" ");

      let op: OPERATION = parseOperation(split[0]);

      switch (op) {
        case OPERATION.FORWARD:
          horizontalPosition += parseInt(split[1]);
          depth += parseInt(split[1]) * aim;
          break;
        case OPERATION.DOWN:
          aim += parseInt(split[1]);
          break;
        case OPERATION.UP:
          aim -= parseInt(split[1]);
      }
    }
  }

  return horizontalPosition * depth;
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
