import { readInput, test } from "../utils"
import { readInputFromSpecialFile, splitToLines } from "../utils/readInput"

const prepareInput = (rawInput: string) => rawInput

const input = prepareInput(readInput())

interface Dot {
  x: number;
  y: number;
}

enum FOLD_DIRECTION {
  HORIZONTAL,
  VERTICAL
}

interface FoldInstruction {
  direction: FOLD_DIRECTION,
  position: number
}

const isEmptyLine = (line: string): boolean => {
  return line === "" || line === "\n" || line === "\r\n"
}

const parseInput = (lines: string[]): { dots: Dot[], instructions: FoldInstruction[] } => {
  const dots: Dot[] = []
  const instructions: FoldInstruction[] = []

  for (let line of lines) {
    if (!line.startsWith("fold")) {
      let parts = line.split(",")
      dots.push({ x: parseInt(parts[0]), y: parseInt(parts[1]) })
    } else {
      let parts = line.split("=")
      if (parts[0].charAt(parts[0].length - 1) === "y") {
        instructions.push({ direction: FOLD_DIRECTION.VERTICAL, position: parseInt(parts[1]) })
      } else {
        instructions.push({ direction: FOLD_DIRECTION.HORIZONTAL, position: parseInt(parts[1]) })
      }
    }
  }

  return { dots: dots, instructions: instructions }
}

const foldForInstruction = (dots: Dot[], instruction: FoldInstruction): Dot[] => {
  let newDots: Dot[] = []

  switch (instruction.direction) {
    case FOLD_DIRECTION.VERTICAL:
      for (let dot of dots) {
        if (dot.y < instruction.position) {
          newDots.push(dot)
        } else {
          let differenceToFoldLine: number = dot.y - instruction.position

          let dotAtFoldedPosition = dots.find(value => value.x === dot.x && value.y === instruction.position - differenceToFoldLine)

          if (!dotAtFoldedPosition) {
            newDots.push({ x: dot.x, y: instruction.position - differenceToFoldLine })
          }
        }
      }
      break
    case FOLD_DIRECTION.HORIZONTAL:
      for (let dot of dots) {
        if (dot.x < instruction.position) {
          newDots.push(dot)
        } else {
          let differenceToFoldLine: number = dot.x - instruction.position

          let dotAtFoldedPosition = dots.find(value => value.y === dot.y && value.x === instruction.position - differenceToFoldLine)

          if (!dotAtFoldedPosition) {
            newDots.push({ x: instruction.position - differenceToFoldLine, y: dot.y })
          }
        }
      }
      break
  }

  return newDots
}

const toPrintableArray = (dots: Dot[]): string[] => {
  const dotsOnMap: Map<number, Map<number, number>> = new Map()

  for (let dot of dots) {
    if (!dotsOnMap.has(dot.y)) {
      dotsOnMap.set(dot.y, new Map())
    }
    dotsOnMap.get(dot.y).set(dot.x, 1)
  }

  let sortedByValue: number[][] = Array.from(dotsOnMap.keys()).map(yArray => Array.from(dotsOnMap.get(yArray).keys()).sort((a, b) => a - b))
  let minimumX = sortedByValue.map(value => value[0]).sort((a, b) => a - b)[0]
  let maximumX = sortedByValue.map(value => value[value.length - 1]).sort((a, b) => a - b)[sortedByValue.length - 1]

  const visualRepresentation: string[] = []

  for (let y of Array.from(dotsOnMap.keys()).sort((a, b) => a - b)) {
    let stringRep: string = ""
    for (let x = minimumX; x <= maximumX; x++) {
      if (dotsOnMap.get(y).has(x)) {
        stringRep += "#"
      } else {
        stringRep += "."
      }
    }

    visualRepresentation.push(stringRep)
  }

  return visualRepresentation
}

const goA = (input) => {
  const lines = splitToLines(input)
  let { dots, instructions } = parseInput(lines)

  return foldForInstruction(dots, instructions[0]).length
}

const goB = (input) => {
  const lines = splitToLines(input)
  let { dots, instructions } = parseInput(lines)

  for (let instruction of instructions) {
    dots = foldForInstruction(dots, instruction)
  }

  const visualRepresentation: string[] = toPrintableArray(dots)

  let oneLine: string = ""

  for (let line of visualRepresentation) {
    oneLine += line + "\n"
  }

  return oneLine
}

/* Tests */

test(goA(prepareInput(readInputFromSpecialFile("testInput.txt"))), 17)

/* Results */

console.time("Time")
const resultA = goA(input)
const resultB = goB(input)
console.timeEnd("Time")

console.log("Solution to part 1:", resultA)
console.log("Solution to part 2:", resultB)
