import { readInput, test } from "../utils"
import { readInputFromSpecialFile, splitToLines } from "../utils/readInput"

const prepareInput = (rawInput: string) => rawInput

const input = prepareInput(readInput())

interface Position {
  x: number;
  y: number;
}

const getArea = (lines: string[]): number[][] => {
  const area: number[][] = []

  for (let line of lines) {
    area.push(Array.from(line).filter(value => value !== "").map(value => parseInt(value)))
  }

  return area
}

const getNeighbourPositions = (position: Position, maxX: number, maxY: number): Position[] => {
  let neighbourPositions: Position[] = []

  if (position.x > 0) {
    neighbourPositions.push({ x: position.x - 1, y: position.y })
  }

  if (position.x < maxX - 1) {
    neighbourPositions.push({ x: position.x + 1, y: position.y })
  }

  if (position.x > 0 && position.y > 0) {
    neighbourPositions.push({ x: position.x - 1, y: position.y - 1 })
  }
  if (position.x < maxX - 1 && position.y > 0) {
    neighbourPositions.push({ x: position.x + 1, y: position.y - 1 })
  }

  if (position.y > 0) {
    neighbourPositions.push({ x: position.x, y: position.y - 1 })
  }

  if (position.y < maxY - 1) {
    neighbourPositions.push({ x: position.x, y: position.y + 1 })
  }

  if (position.x > 0 && position.y < maxY - 1) {
    neighbourPositions.push({ x: position.x - 1, y: position.y + 1 })
  }

  if (position.x < maxX - 1 && position.y < maxY - 1) {
    neighbourPositions.push({ x: position.x + 1, y: position.y + 1 })
  }

  return neighbourPositions
}

const increaseEnergyLevelOfPositionsByOne = (area: number[][], positions: Position[]): number[][] => {
  for (let position of positions) {
    area[position.y][position.x] = area[position.y][position.x] + 1
  }

  return area
}

const calculateUpdatedArea = (area: number[][]): { updatedArea: number[][], flashedInUpdate: number } => {

  const positionsToCheck: Position[] = []
  const flashedPositions: Position[] = []

  for (let y = 0; y < area.length; y++) {
    for (let x = 0; x < area[y].length; x++) {
      positionsToCheck.push({ x: x, y: y })
    }
  }

  area = increaseEnergyLevelOfPositionsByOne(area, positionsToCheck)

  while (positionsToCheck.length > 0) {
    const currentPosition = positionsToCheck.pop()

    if (area[currentPosition.y][currentPosition.x] > 9) {
      flashedPositions.push(currentPosition)

      let neighboursToUpdate = getNeighbourPositions(currentPosition, area.length, area[currentPosition.y].length).filter(position => flashedPositions.every(flashedPosition => flashedPosition.x !== position.x || flashedPosition.y !== position.y))

      area = increaseEnergyLevelOfPositionsByOne(area, neighboursToUpdate)

      for (let neighbour of neighboursToUpdate) {
        if (!positionsToCheck.find(position => position.x === neighbour.x && position.y === neighbour.y)) {
          positionsToCheck.push(neighbour)
        }
      }
    }
  }

  for (let flashed of flashedPositions) {
    area[flashed.y][flashed.x] = 0
  }

  return { updatedArea: area, flashedInUpdate: flashedPositions.length }
}

const goA = (input) => {
  const lines = splitToLines(input)
  let area: number[][] = getArea(lines)

  let flashedLights: number = 0

  for (let i = 0; i < 100; i++) {
    const { updatedArea, flashedInUpdate } = calculateUpdatedArea(area)
    area = updatedArea
    flashedLights += flashedInUpdate
  }

  return flashedLights
}

const goB = (input) => {
  const lines = splitToLines(input)
  let area: number[][] = getArea(lines)

  const areaSize: number = area.length * area[0].length
  let flashedLights: number = 0

  let steps: number = 0
  while (flashedLights !== areaSize) {
    const { updatedArea, flashedInUpdate } = calculateUpdatedArea(area)
    area = updatedArea
    flashedLights = flashedInUpdate
    steps++
  }

  return steps
}

/* Tests */

test(goA(prepareInput(readInputFromSpecialFile("testInput.txt"))), 1656)
test(goB(prepareInput(readInputFromSpecialFile("testInput.txt"))), 195)

/* Results */

console.time("Time")
const resultA = goA(input)
const resultB = goB(input)
console.timeEnd("Time")

console.log("Solution to part 1:", resultA)
console.log("Solution to part 2:", resultB)
