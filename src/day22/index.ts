import { readInput, test } from "../utils"
import { readInputFromSpecialFile, splitToLines } from "../utils/readInput"

const prepareInput = (rawInput: string) => rawInput

const input = prepareInput(readInput())

interface Area {
  fromX: number;
  toX: number;
  fromY: number;
  toY: number;
  fromZ: number;
  toZ: number;
}

interface Instruction {
  sign: number;
  area: Area;
}

const parseInstruction = (line: string): Instruction => {
  const onInstruction: boolean = line.startsWith("on")

  const coordinationParts: string[] = line.substring(2).split(",")
  const xRange: string[] = coordinationParts[0].split("=")[1].split("..")
  const yRange: string[] = coordinationParts[1].split("=")[1].split("..")
  const zRange: string[] = coordinationParts[2].split("=")[1].split("..")

  return {
    sign: onInstruction ? 1 : -1,
    area: {
      fromX: parseInt(xRange[0]),
      toX: parseInt(xRange[1]),
      fromY: parseInt(yRange[0]),
      toY: parseInt(yRange[1]),
      fromZ: parseInt(zRange[0]),
      toZ: parseInt(zRange[1]),
    },
  }
}
const goA = (input) => {
  const lines = splitToLines(input)
  const instructions: Instruction[] = lines.map(line => parseInstruction(line))

  const area: number[][][] = []

  for (let x = -50; x <= 50; x++) {
    let yArr: number[][] = []
    for (let y = -50; y <= 50; y++) {
      let zArr: number[] = []
      for (let z = -50; z <= 50; z++) {
        zArr.push(0)
      }
      yArr.push(zArr)
    }
    area.push(yArr)
  }

  for (let instruction of instructions) {
    if (instruction.area.fromX >= -50 && instruction.area.toX <= 50 && instruction.area.fromY >= -50 && instruction.area.toY <= 50 && instruction.area.fromZ >= -50 && instruction.area.toZ <= 50) {
      for (let x = instruction.area.fromX; x <= instruction.area.toX; x++) {
        for (let y = instruction.area.fromY; y <= instruction.area.toY; y++) {
          for (let z = instruction.area.fromZ; z <= instruction.area.toZ; z++) {
            area[x + 50][y + 50][z + 50] = instruction.sign === 1 ? 1 : 0
          }
        }
      }
    }
  }

  let litCubes: number = 0

  for (let x = -50; x <= 50; x++) {
    for (let y = -50; y <= 50; y++) {
      for (let z = -50; z <= 50; z++) {
        litCubes += area[x + 50][y + 50][z + 50]
      }
    }
  }

  return litCubes
}

const goB = (input) => {
  const lines = splitToLines(input)
  const instructions: Instruction[] = lines.map(line => parseInstruction(line))

  const areas: Map<Area, number> = new Map<Area, number>()

  for (let instruction of instructions) {
    for (let area of Array.from(areas.keys())) {
      let maxFromX: number = Math.max(instruction.area.fromX, area.fromX)
      let minToX: number = Math.min(instruction.area.toX, area.toX)
      let maxFromY: number = Math.max(instruction.area.fromY, area.fromY)
      let minToY: number = Math.min(instruction.area.toY, area.toY)
      let maxFromZ: number = Math.max(instruction.area.fromZ, area.fromZ)
      let minToZ: number = Math.min(instruction.area.toZ, area.toZ)

      if (maxFromX <= minToX && maxFromY <= minToY && maxFromZ <= minToZ) {
        let sameInstruction = Array.from(areas.keys()).find(area => area.fromX === maxFromX && area.toX === minToX && area.fromY === maxFromY && area.toY === minToY && area.fromZ === maxFromZ && area.toZ === minToZ)
        if (sameInstruction) {
          areas.set(sameInstruction, areas.get(sameInstruction) - areas.get(area))
        } else {
          areas.set({
            fromX: maxFromX,
            toX: minToX,
            fromY: maxFromY,
            toY: minToY,
            fromZ: maxFromZ,
            toZ: minToZ,
          }, -1 * areas.get(area))
        }
      }
    }

    if (instruction.sign > 0) {
      let sameInstruction = Array.from(areas.keys()).find(area => area.fromX === instruction.area.fromX && area.toX === instruction.area.toX && area.fromY === instruction.area.fromY && area.toY === instruction.area.toY && area.fromZ === instruction.area.fromZ && area.toZ === instruction.area.toZ)
      if (sameInstruction) {
        areas.set(sameInstruction, areas.get(sameInstruction) + 1)
      } else {
        areas.set(instruction.area, 1)
      }
    }
  }

  return Array.from(areas.keys()).map(area => (area.toX - area.fromX + 1) * (area.toY - area.fromY + 1) * (area.toZ - area.fromZ + 1) * areas.get(area)).reduce((previousValue, currentValue) => previousValue + currentValue, 0)
}

/* Tests */

test(goA(prepareInput(readInputFromSpecialFile("testInput.txt"))), 590784)
test(goB(prepareInput(readInputFromSpecialFile("testInputPart2.txt"))), 2758514936282235)

/* Results */

console.time("Time")
const resultA = goA(input)
const resultB = goB(input)
console.timeEnd("Time")

console.log("Solution to part 1:", resultA)
console.log("Solution to part 2:", resultB)
