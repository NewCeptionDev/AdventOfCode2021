import { readInput, test } from "../utils"
import { readInputFromSpecialFile } from "../utils/readInput"

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
  zeroAtEnd: boolean;
}

const parseArea = (line: string): Area => {
  const partsTogether = line.split(":")[1]
  const partsSplit = partsTogether.split(",")
  const xPart = partsSplit[0].split("=")
  const yPart = partsSplit[1].split("=")
  const xPartNumbers = xPart[1].split("..")
  const yPartNumbers = yPart[1].split("..")

  return {
    fromX: parseInt(xPartNumbers[0]),
    toX: parseInt(xPartNumbers[1]),
    toY: parseInt(yPartNumbers[0]),
    fromY: parseInt(yPartNumbers[1]),
  }
}

const checkPossibleXPosition = (x: number, area: Area): PossibleX[] => {
  let steps: number = 0
  let currentPlus: number = x
  let currentX: number = 0

  let possible: PossibleX[] = []

  while (currentX <= area.toX && currentPlus !== 0) {
    steps++
    currentX += currentPlus
    currentPlus += currentPlus >= 0 ? currentPlus === 0 ? 0 : -1 : 1

    if (area.fromX <= currentX && area.toX >= currentX) {
      possible.push({
        x: x,
        steps: steps,
        zeroAtEnd: currentPlus === 0,
      })
    }
  }

  return possible
}

const findPossibleXs = (area: Area): PossibleX[] => {
  const foundPossibleX: PossibleX[] = []

  let currentTest: number = Math.floor(Math.sqrt(area.fromX))
  let justFound: boolean = false

  while (currentTest <= area.toX) {
    let maybe: PossibleX[] = checkPossibleXPosition(currentTest, area)
    if (maybe.length > 0) {
      foundPossibleX.push(...maybe)
      justFound = true
    } else {
      justFound = false
    }
    currentTest++
  }

  return foundPossibleX
}

const checkIfLaunchHits = (area: Area, possibleX: PossibleX, y: number): number | undefined => {
  let yVelocity: number = y
  let currentY: number = 0
  let highestY: number = 0

  let stepsNeeded: number = 0

  while (currentY > area.toY) {
    stepsNeeded++

    currentY += yVelocity
    yVelocity--

    if (yVelocity === 0) {
      highestY = currentY
    }
  }

  if (currentY <= area.fromY && currentY >= area.toY && stepsNeeded >= possibleX.steps) {
    return highestY
  }

  return undefined
}

const actualCheckIfLaunchHits = (area: Area, possibleX: PossibleX, y: number): boolean => {
  let yVelocity: number = y
  let currentY: number = 0

  let stepsNeeded: number = 0

  while (currentY >= area.toY) {
    stepsNeeded++

    currentY += yVelocity
    yVelocity--

    if (currentY <= area.fromY && currentY >= area.toY && (stepsNeeded === possibleX.steps || (stepsNeeded >= possibleX.steps && possibleX.zeroAtEnd))) {
      return true
    }
  }

  return false
}

const findHighestStartYForPossibleX = (possibleX: PossibleX, area: Area): number => {

  let possibleHighestYPositions: number[] = []

  let currentY: number = -1000
  let justFound: boolean = false

  while (currentY < 1000) {
    let highestYPosition: number | undefined = checkIfLaunchHits(area, possibleX, currentY)

    if (highestYPosition !== undefined) {
      possibleHighestYPositions.push(highestYPosition)
      justFound = true
    } else {
      justFound = false
    }
    currentY++
  }

  let sorted = possibleHighestYPositions.sort((a, b) => a - b)

  return sorted[sorted.length - 1]
}

const findYPositionsForPossibleX = (possibleX: PossibleX, area: Area): number[] => {
  let possibleYPositions: number[] = []

  let currentY: number = -1000

  while (currentY < 1000) {
    if (actualCheckIfLaunchHits(area, possibleX, currentY)) {
      possibleYPositions.push(currentY)
    }
    currentY++
  }

  return possibleYPositions
}

const goA = (input) => {
  const area: Area = parseArea(input)

  const possibleXs: PossibleX[] = findPossibleXs(area)
  const highestYPositions: number[] = []

  for (let possibleX of possibleXs) {
    highestYPositions.push(findHighestStartYForPossibleX(possibleX, area))
  }

  let sorted = highestYPositions.sort((a, b) => a - b)

  return sorted[sorted.length - 1]
}

const goB = (input) => {
  const area: Area = parseArea(input)

  const possibleXs: PossibleX[] = findPossibleXs(area)
  const distinctVelocities: { x: number, y: number }[] = []

  for (let possibleX of possibleXs) {
    findYPositionsForPossibleX(possibleX, area).forEach(velocity => {
      if (distinctVelocities.every(distinct => distinct.x !== possibleX.x || distinct.y !== velocity)) {
        distinctVelocities.push({ x: possibleX.x, y: velocity })
      }
    })
  }

  return distinctVelocities.length
}

/* Tests */

test(goA(prepareInput(readInputFromSpecialFile("testInput.txt"))), 45)
test(goB(prepareInput(readInputFromSpecialFile("testInput.txt"))), 112)

/* Results */

console.time("Time")
const resultA = goA(input)
const resultB = goB(input)
console.timeEnd("Time")

console.log("Solution to part 1:", resultA)
console.log("Solution to part 2:", resultB)
