import { readInput, test } from "../utils"
import { readInputFromSpecialFile, splitToLines } from "../utils/readInput"

const prepareInput = (rawInput: string) => rawInput

const input = prepareInput(readInput())

enum AreaFields {
  EMPTY,
  EAST,
  SOUTH,
  NOT_SET
}

const parseArea = (lines: string[]): AreaFields[][] => {
  return lines.map(line => Array.from(line).map(letter => {
    switch (letter) {
      case ".":
        return AreaFields.EMPTY
      case ">":
        return AreaFields.EAST
      case "v":
        return AreaFields.SOUTH
    }
  }))
}

const goA = (input) => {
  const lines: string[] = splitToLines(input)
  const area: AreaFields[][] = parseArea(lines)

  let newArea: AreaFields[][] = undefined
  let steps: number = 0
  let moved: boolean = true

  while (moved) {
    const createdArea: AreaFields[][] = []
    if (newArea === undefined) {
      newArea = area
    }

    for (let y = 0; y < newArea.length; y++) {
      createdArea.push(Array(newArea[y].length).fill(AreaFields.NOT_SET))
    }

    moved = false

    for (let y = 0; y < newArea.length; y++) {
      for (let x = 0; x < newArea[y].length; x++) {
        if (newArea[y][x] === AreaFields.EAST) {
          if (x + 1 < newArea[y].length) {
            if (newArea[y][x + 1] === AreaFields.EMPTY) {
              createdArea[y][x] = AreaFields.EMPTY
              createdArea[y][x + 1] = AreaFields.EAST
              moved = true
            } else {
              createdArea[y][x] = AreaFields.EAST
            }
          } else {
            if (newArea[y][0] === AreaFields.EMPTY) {
              createdArea[y][x] = AreaFields.EMPTY
              createdArea[y][0] = AreaFields.EAST
              moved = true
            } else {
              createdArea[y][x] = AreaFields.EAST
            }
          }
        } else {
          if (createdArea[y][x] === AreaFields.NOT_SET) {
            createdArea[y][x] = newArea[y][x]
          }
        }
      }
    }

    const secondStepArea: AreaFields[][] = []

    for (let y = 0; y < createdArea.length; y++) {
      secondStepArea.push(Array(createdArea[y].length).fill(AreaFields.NOT_SET))
    }

    for (let y = 0; y < createdArea.length; y++) {
      for (let x = 0; x < createdArea[y].length; x++) {
        if (createdArea[y][x] === AreaFields.SOUTH) {
          if (y + 1 < createdArea.length) {
            if (createdArea[y + 1][x] === AreaFields.EMPTY) {
              secondStepArea[y][x] = AreaFields.EMPTY
              secondStepArea[y + 1][x] = AreaFields.SOUTH
              moved = true
            } else {
              secondStepArea[y][x] = AreaFields.SOUTH
            }
          } else {
            if (createdArea[0][x] === AreaFields.EMPTY) {
              secondStepArea[y][x] = AreaFields.EMPTY
              secondStepArea[0][x] = AreaFields.SOUTH
              moved = true
            } else {
              secondStepArea[y][x] = AreaFields.SOUTH
            }
          }
        } else {
          if (secondStepArea[y][x] === AreaFields.NOT_SET) {
            secondStepArea[y][x] = createdArea[y][x]
          }
        }
      }
    }

    newArea = secondStepArea
    steps++
  }

  return steps
}

/* Tests */

test(goA(prepareInput(readInputFromSpecialFile("testInput.txt"))), 58)

/* Results */

console.time("Time")
const resultA = goA(input)
console.timeEnd("Time")

console.log("Solution to part 1:", resultA)
