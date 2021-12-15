import { readInput, test } from "../utils"
import { readInputFromSpecialFile, splitToLines } from "../utils/readInput"

const prepareInput = (rawInput: string) => rawInput

const input = prepareInput(readInput())

interface Position {
  x: number;
  y: number;
}

interface LowestRiskPath {
  totalRiskToPath: number;
  path: Position[];
}

const parseArea = (lines: string[]): number[][] => {
  return lines.map(line => Array.from(line).map(value => parseInt(value)).filter(value => value !== undefined))
}

const getNeighboursOfPosition = (position: Position, maxX: number, maxY: number) => {
  let neighbourPositions: Position[] = []

  if (position.x > 0) {
    neighbourPositions.push({ x: position.x - 1, y: position.y })
  }

  if (position.x < maxX - 1) {
    neighbourPositions.push({ x: position.x + 1, y: position.y })
  }

  if (position.y > 0) {
    neighbourPositions.push({ x: position.x, y: position.y - 1 })
  }

  if (position.y < maxY - 1) {
    neighbourPositions.push({ x: position.x, y: position.y + 1 })
  }

  return neighbourPositions
}

const findLowestRiskPathToEnd = (area: number[][]) => {
  const calculatedPaths: Map<number, Map<number, LowestRiskPath>> = new Map<number, Map<number, LowestRiskPath>>()
  const positionsToCheck: Position[] = []

  calculatedPaths.set(0, new Map<number, LowestRiskPath>())
  calculatedPaths.get(0).set(0, { path: [{ x: 0, y: 0 }], totalRiskToPath: 0 })
  positionsToCheck.push({ x: 0, y: 0 })

  for (let position of positionsToCheck) {
    const neighbours = getNeighboursOfPosition(position, area[position.y].length, area.length)

    const pathToPosition = calculatedPaths.get(position.y).get(position.x)

    for (let neighbour of neighbours) {
      let riskToNeighbour = pathToPosition.totalRiskToPath + area[neighbour.y][neighbour.x]
      let pathToNeighbour = pathToPosition.path.slice(0)
      pathToNeighbour.push(neighbour)

      if (calculatedPaths.has(neighbour.y) && calculatedPaths.get(neighbour.y).has(neighbour.x)) {
        if (calculatedPaths.get(neighbour.y).get(neighbour.x).totalRiskToPath > riskToNeighbour) {
          calculatedPaths.get(neighbour.y).get(neighbour.x).totalRiskToPath = riskToNeighbour
          calculatedPaths.get(neighbour.y).get(neighbour.x).path = pathToNeighbour
          positionsToCheck.push(neighbour)
        }
      } else {
        if (!calculatedPaths.has(neighbour.y)) {
          calculatedPaths.set(neighbour.y, new Map<number, LowestRiskPath>())
        }

        if (!calculatedPaths.get(neighbour.y).has(neighbour.x)) {
          calculatedPaths.get(neighbour.y).set(neighbour.x, { path: pathToNeighbour, totalRiskToPath: riskToNeighbour })
          positionsToCheck.push(neighbour)
        }
      }
    }
  }

  const sortedY = Array.from(calculatedPaths.keys()).sort((a, b) => a - b)
  const maxY = sortedY[sortedY.length - 1]
  const sortedX = Array.from(calculatedPaths.get(maxY).keys()).sort((a, b) => a - b)
  const maxX = sortedX[sortedX.length - 1]

  return calculatedPaths.get(maxY).get(maxX)
}

const buildFullArea = (area: number[][]) => {
  const fullArea: number[][] = []

  for (let enlargeY = 0; enlargeY < 5; enlargeY++) {
    for (let y = 0; y < area.length; y++) {
      let areaRow: number[] = []
      for (let enlargeX = 0; enlargeX < 5; enlargeX++) {
        areaRow.push(...(area[y].map(value => value + enlargeX + enlargeY).map(value => value > 9 ? value - 9 : value)))
      }
      fullArea[(area.length * enlargeY) + y] = areaRow
    }
  }

  return fullArea
}

const goA = (input) => {
  const lines = splitToLines(input)
  const area = parseArea(lines)

  return findLowestRiskPathToEnd(area).totalRiskToPath
}

const goB = (input) => {
  const lines = splitToLines(input)
  const area = parseArea(lines)
  const fullArea = buildFullArea(area)

  return findLowestRiskPathToEnd(fullArea).totalRiskToPath
}

/* Tests */

test(goB(prepareInput(readInputFromSpecialFile("testInput.txt"))), 315)

/* Results */

console.time("Time")
const resultA = goA(input)
const resultB = goB(input)
console.timeEnd("Time")

console.log("Solution to part 1:", resultA)
console.log("Solution to part 2:", resultB)
