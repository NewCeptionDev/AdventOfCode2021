import { test, readInput } from "../utils"
import { readInputFromSpecialFile } from "../utils/readInput"

const prepareInput = (rawInput: string) => rawInput

const input = prepareInput(readInput())

interface CloudLine {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

interface Position {
  x: number;
  y: number;
}

const parseLine = (line: string): CloudLine => {
  const lineParts = line.split("->")
  const startPoint = lineParts[0].split(",")
  const endPoint = lineParts[1].split(",")

  return {
    startX: parseInt(startPoint[0]),
    startY: parseInt(startPoint[1]),
    endX: parseInt(endPoint[0]),
    endY: parseInt(endPoint[1]),
  }
}

const getAffectedPositions = (cloudLine: CloudLine, considerDiagonal: boolean): Position[] => {
  let positions: Position[] = []

  let pureVertical: boolean = cloudLine.startX === cloudLine.endX
  let pureHorizontal: boolean = cloudLine.startY === cloudLine.endY

  const horizontalDirection: number = cloudLine.startX <= cloudLine.endX ? 1 : -1
  const verticalDirection: number = cloudLine.startY <= cloudLine.endY ? 1 : -1
  const horizontalCondition = (currentValue: number): boolean => cloudLine.startX <= cloudLine.endX ? currentValue <= cloudLine.endX : currentValue >= cloudLine.endX
  const verticalCondition = (currentValue: number): boolean => cloudLine.startY <= cloudLine.endY ? currentValue <= cloudLine.endY : currentValue >= cloudLine.endY

  if (pureVertical) {
    for (let y = cloudLine.startY; verticalCondition(y); y += verticalDirection) {
      positions.push({ x: cloudLine.startX, y: y })
    }
  } else if (pureHorizontal) {
    for (let x = cloudLine.startX; horizontalCondition(x); x += horizontalDirection) {
      positions.push({ x: x, y: cloudLine.startY })
    }
  } else if (considerDiagonal) {
    for (let x = cloudLine.startX, y = cloudLine.startY; horizontalCondition(x) && verticalCondition(y); x += horizontalDirection, y += verticalDirection) {
      positions.push({ x: x, y: y })
    }
  }

  return positions
}

const calculateOceanFloor = (cloudLines: CloudLine[], considerDiagonal: boolean): Map<number, Map<number, number>> => {
  const oceanFloor: Map<number, Map<number, number>> = new Map()

  for (let cloudLine of cloudLines) {
    const affectedPositions = getAffectedPositions(cloudLine, considerDiagonal)

    for (let position of affectedPositions) {
      if (oceanFloor.has(position.y)) {
        if (oceanFloor.get(position.y).has(position.x)) {
          oceanFloor.get(position.y).set(position.x, oceanFloor.get(position.y).get(position.x) + 1)
        } else {
          oceanFloor.get(position.y).set(position.x, 1)
        }
      } else {
        let newHorizontalMap: Map<number, number> = new Map<number, number>()
        newHorizontalMap.set(position.x, 1)

        oceanFloor.set(position.y, newHorizontalMap)
      }
    }
  }

  return oceanFloor
}

const countPositionsWithAtLeastTwoLines = (oceanFloor: Map<number, Map<number, number>>) => {
  let positionsWithAtLeastTwoLines: number = 0

  for (let horizontalMap of Array.from(oceanFloor.values())) {
    positionsWithAtLeastTwoLines += Array.from(horizontalMap.values()).filter(value => value >= 2).length
  }

  return positionsWithAtLeastTwoLines
}

const goA = (input) => {
  const lines = input.split("\n").filter(line => line !== "")

  const cloudLines: CloudLine[] = lines.map(line => parseLine(line))

  const oceanFloor: Map<number, Map<number, number>> = calculateOceanFloor(cloudLines, false)

  return countPositionsWithAtLeastTwoLines(oceanFloor)
}

const goB = (input) => {
  const lines = input.split("\n").filter(line => line !== "")

  const cloudLines: CloudLine[] = lines.map(line => parseLine(line))

  const oceanFloor: Map<number, Map<number, number>> = calculateOceanFloor(cloudLines, true)

  return countPositionsWithAtLeastTwoLines(oceanFloor)
}

/* Tests */

test(goA(prepareInput(readInputFromSpecialFile("testInput.txt"))), 5)
test(goB(prepareInput(readInputFromSpecialFile("testInput.txt"))), 12)

/* Results */

console.time("Time")
const resultA = goA(input)
const resultB = goB(input)
console.timeEnd("Time")

console.log("Solution to part 1:", resultA)
console.log("Solution to part 2:", resultB)
