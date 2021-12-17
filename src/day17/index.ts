import { readInput } from "../utils"

const prepareInput = (rawInput: string) => rawInput

const input = prepareInput(readInput())

interface Area {
  fromX: number;
  toX: number;
  fromY: number;
  toY: number;
}

interface PossibleX {
  x: number;
  steps: number;
  endX: number;
}

const parseArea = (line: string): Area => {
  const partsTogether = line.split(":")[1]
  const partsSplit = line.split(",")
  const xPart = partsSplit[0].split("=")
  const yPart = partsSplit[1].split("=")
  const xPartNumbers = xPart[1].split("..")
  const yPartNumbers = yPart[1].split("..")

  return {
    fromX: parseInt(xPartNumbers[0]),
    toX: parseInt(xPartNumbers[1]),
    fromY: parseInt(yPartNumbers[0]),
    toY: parseInt(yPartNumbers[1]),
  }
}

const checkPossibleXPosition = (x: number, area: Area): PossibleX | undefined => {
  let steps = 0
  let currentPlus = x
  let currentX = 0
  while (currentX < area.toX) {
    steps++
    currentX += currentPlus
    currentPlus += currentPlus >= 0 ? currentPlus === 0 ? 0 : -1 : 1
  }

  if (area.fromX <= currentX && area.toX >= currentX) {
    return {
      x: x,
      endX: currentX,
      steps: steps,
    }
  }
  return undefined
}

const findPossibleXs = (area: Area): PossibleX[] => {
  const foundPossibleX: PossibleX[] = []

  let currentTest: number = Math.floor(Math.sqrt(area.fromX))
  let justFound: boolean = false

  while (foundPossibleX.length === 0 || justFound) {
    let maybe = checkPossibleXPosition(currentTest, area)
    if (maybe) {
      foundPossibleX.push(maybe)
      justFound = true
    } else {
      justFound = false
    }
    currentTest++
  }

  return foundPossibleX
}

const goA = (input) => {
  const area: Area = parseArea(input)

  console.log(area)

  return
}

const goB = (input) => {
  return
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
