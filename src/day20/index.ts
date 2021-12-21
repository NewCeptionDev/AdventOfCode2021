import { readInput, test } from "../utils"
import { readInputFromSpecialFile, splitToLines } from "../utils/readInput"

const prepareInput = (rawInput: string) => rawInput

const input = prepareInput(readInput())

const parseArea = (lines: string[]): Map<number, Map<number, number>> => {
  const area: Map<number, Map<number, number>> = new Map<number, Map<number, number>>()

  for (let i = 0; i < lines.length; i++) {
    const pointsInRow: Map<number, number> = new Map<number, number>()

    const allPointInRow = Array.from(lines[i]).map(char => char === "#" ? 1 : 0)
    for (let j = 0; j < allPointInRow.length; j++) {
      if (allPointInRow[j] === 1) {
        pointsInRow.set(j, 1)
      } else {
        pointsInRow.set(j, 0)
      }
    }

    area.set(i, pointsInRow)
  }

  return area
}

const getBinaryNumberForPosition = (xPos: number, yPos: number, area: Map<number, Map<number, number>>, defaultValue: string) => {
  let binary: string = ""

  for (let y = yPos - 1; y <= yPos + 1; y++) {
    for (let x = xPos - 1; x <= xPos + 1; x++) {
      if (area.has(y) && area.get(y).has(x)) {
        if (area.get(y).get(x) === 1) {
          binary += "1"
        } else {
          binary += "0"
        }
      } else {
        binary += defaultValue
      }
    }
  }

  return binary
}

const transformBinaryToDecimal = (binary: string): number => {
  let decimal: number = 0

  for (let i = binary.length - 1; i >= 0; i--) {
    if (binary[i] === "1") {
      decimal += Math.pow(2, binary.length - i - 1)
    }
  }

  return decimal
}

const applyAlgorithm = (area: Map<number, Map<number, number>>, algorithm: number[], step: number): Map<number, Map<number, number>> => {
  let newMap: Map<number, Map<number, number>> = new Map<number, Map<number, number>>()

  const areaKeySorted: number[] = Array.from(area.keys()).sort((a, b) => a - b)
  const smallestRow: number = areaKeySorted[0]
  const largestRow: number = areaKeySorted[areaKeySorted.length - 1]

  let smallestColumn: number = Number.MAX_SAFE_INTEGER
  let largestColumn: number = Number.MIN_SAFE_INTEGER

  for (let key of areaKeySorted) {
    const sortedRow: number[] = Array.from(area.get(key).keys()).sort((a, b) => a - b)
    if (sortedRow[0] < smallestColumn) {
      smallestColumn = sortedRow[0]
    }
    if (sortedRow[sortedRow.length - 1] > largestColumn) {
      largestColumn = sortedRow[sortedRow.length - 1]
    }
  }

  for (let y = smallestRow - 2; y <= largestRow + 2; y++) {
    for (let x = smallestColumn - 2; x <= largestColumn + 2; x++) {
      const binaryForPositionAsString: string = getBinaryNumberForPosition(x, y, area, algorithm[0] === 1 && step % 2 === 0 ? "1" : "0")
      const binary: number = transformBinaryToDecimal(binaryForPositionAsString)

      if (!newMap.has(y)) {
        newMap.set(y, new Map<number, number>())
      }

      if (algorithm[binary] === 1) {
        newMap.get(y).set(x, 1)
      } else {
        newMap.get(y).set(x, 0)
      }
    }
  }

  return newMap
}

const countLitPixels = (area: Map<number, Map<number, number>>): number => {
  let litPixels = 0

  for (let key of Array.from(area.keys())) {
    litPixels += Array.from(area.get(key).values()).filter(value => value === 1).length
  }

  return litPixels
}

const goA = (input) => {
  const lines: string[] = splitToLines(input)
  const algorithm: number[] = Array.from(lines[0]).map(char => char === "#" ? 1 : 0)
  let area: Map<number, Map<number, number>> = parseArea(lines.slice(1))

  for (let i = 0; i < 2; i++) {
    area = applyAlgorithm(area, algorithm, i + 1)
  }

  return countLitPixels(area)
}

const goB = (input) => {
  const lines: string[] = splitToLines(input)
  const algorithm: number[] = Array.from(lines[0]).map(char => char === "#" ? 1 : 0)
  let area: Map<number, Map<number, number>> = parseArea(lines.slice(1))

  for (let i = 0; i < 50; i++) {
    area = applyAlgorithm(area, algorithm, i + 1)
  }

  return countLitPixels(area)
}

/* Tests */

test(goA(prepareInput(readInputFromSpecialFile("testInput.txt"))), 35)
test(goA(prepareInput(readInputFromSpecialFile("testInput2.txt"))), 5326)

/* Results */

console.time("Time")
const resultA = goA(input)
const resultB = goB(input)
console.timeEnd("Time")

console.log("Solution to part 1:", resultA)
console.log("Solution to part 2:", resultB)
