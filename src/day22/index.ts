import { test, readInput } from "../utils"
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
  on: boolean;
  area: Area;
}

const parseInstruction = (line: string): Instruction => {
  const onInstruction: boolean = line.startsWith("on")

  const coordinationParts: string[] = line.substring(2).split(",")
  const xRange: string[] = coordinationParts[0].split("=")[1].split("..")
  const yRange: string[] = coordinationParts[1].split("=")[1].split("..")
  const zRange: string[] = coordinationParts[2].split("=")[1].split("..")

  return {
    on: onInstruction,
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

const areaIntersectsWithInstruction = (area1: Area, area2: Area) => {
  /*return ((area1.fromX <= area2.fromX && area1.toX >= area2.toX) || (area1.fromX >= area2.fromX && area1.toX >= area2.toX) || (area1.fromX <= area2.fromX && area1.toX <= area2.toX) || (area1.fromX >= area2.fromX && area1.toX <= area2.toX)
  || ((area1.fromY <= area2.fromY && area1.toX >= area2.toX) || (area1.fromY >= area2.fromY && area1.toX >= area2.toX) || (area1.fromY <= area2.fromY && area1.toX <= area2.toY) || (area1.fromY >= area2.fromY && area1.toX <= area2.toX) */
  return !((area1.fromX > area2.toX || area1.toX < area2.fromX) || (area1.fromY > area2.toY || area1.toY < area2.fromY) || (area1.fromZ > area2.toZ || area1.toZ < area2.fromZ));
}

const mergeAreasIfNeeded = (area1: Area, area2: Area): Area[] => {
  const xIntersection = area1.fromX <= area2.toX || area1.toX >= area2.fromX;
  const yIntersection = area1.fromY <= area2.toY || area1.toY >= area2.fromY;
  const zIntersection = area1.fromZ <= area2.toZ || area1.toZ >= area2.fromZ;
  if(xIntersection || yIntersection || zIntersection) {
    let mergedAreas: Area[] = [];

  } else {
    return [];
  }
}

const goA = (input) => {
  const lines = splitToLines(input)
  const instructions: Instruction[] = lines.map(line => parseInstruction(line));

  const turnedOnCubeAreas: Area[] = [];

  let i = 0;
  for(let instruction of instructions) {
    const intersectingAreas: Area[] = turnedOnCubeAreas.filter(area => areaIntersectsWithInstruction(area, instruction.area))

    if(intersectingAreas.length === 0) {
      if(instruction.on) {
        turnedOnCubeAreas.push(instruction.area);
      }
    } else {
      if(instruction.on) {
        for(let intersectArea of intersectingAreas) {
          if(instruction.area.fromX < intersectArea.fromX) {
            intersectArea.fromX = instruction.area.fromX;
          }
          if(instruction.area.toX > intersectArea.toX) {
            intersectArea.toX = instruction.area.toX;
          }
          if(instruction.area.fromY < intersectArea.fromY) {
            intersectArea.fromY = instruction.area.fromY;
          }
          if(instruction.area.toY > intersectArea.toY) {
            intersectArea.toY = instruction.area.toY;
          }
          if(instruction.area.fromZ < intersectArea.fromZ) {
            intersectArea.fromZ = instruction.area.fromZ;
          }
          if(instruction.area.toZ > intersectArea.toZ) {
            intersectArea.toZ = instruction.area.toZ;
          }
        }

        //Merge
      } else {
        for(let intersectArea of intersectingAreas) {
          let newFromX = intersectArea.fromX;
          let newToX = intersectArea.toX;
          let newFromY = intersectArea.fromY;
          let newToY = intersectArea.toY;
          let newFromZ = intersectArea.fromZ;
          let newToZ = intersectArea.toZ;
          if(instruction.area.toX > intersectArea.fromX && instruction.area.toX < intersectArea.toX) {
            newFromX = instruction.area.toX;
          }
          if(instruction.area.toY > intersectArea.fromY && instruction.area.toY < intersectArea.toY) {
            newFromY = instruction.area.toY;
          }
          if(instruction.area.toZ > intersectArea.fromZ && instruction.area.toZ < intersectArea.toZ) {
            newFromZ = instruction.area.toZ;
          }
          if(instruction.area.fromX < intersectArea.toX && instruction.area.fromX > intersectArea.fromX) {
            newToX = instruction.area.fromX;
          }
          if(instruction.area.fromY < intersectArea.toY && instruction.area.fromY > intersectArea.fromY) {
            newToY = instruction.area.fromY;
          }
          if(instruction.area.fromZ < intersectArea.toZ && instruction.area.fromZ > intersectArea.fromZ) {
            newToZ = instruction.area.fromZ;
          }
          if(instruction.area.fromX > intersectArea.fromX && instruction.area.toX < intersectArea.toX) {
            newFromX = instruction.area.toX;
            newToX = instruction.area.fromX;
          }
          if(instruction.area.fromY > intersectArea.fromY && instruction.area.toY < intersectArea.toY) {
            newFromY = instruction.area.toY;
            newToY = instruction.area.fromY;
          }
          if(instruction.area.fromZ > intersectArea.fromZ && instruction.area.toZ < intersectArea.toZ) {
            newFromZ = instruction.area.toZ;
            newToZ = instruction.area.fromZ;
          }

          if(newFromX > newToX || newFromY > newToY || newFromZ > newToZ) {
            turnedOnCubeAreas.splice(turnedOnCubeAreas.indexOf(intersectArea, 1))

            if (newFromX > newToX && newFromY > newToY && newFromZ > newToZ) {
              turnedOnCubeAreas.push({
                fromX: intersectArea.fromX,
                toX: intersectArea.toX,
                fromZ: intersectArea.fromZ,
                toZ: intersectArea.toZ,
                fromY: intersectArea.fromY,
                toY: newToY //-1?
              })
              turnedOnCubeAreas.push({
                fromX: intersectArea.fromX,
                toX: intersectArea.toX,
                fromZ: intersectArea.fromZ,
                toZ: intersectArea.toZ,
                fromY: newFromY,
                toY: intersectArea.toY
              })
              turnedOnCubeAreas.push({
                fromX: intersectArea.fromX,
                toX: intersectArea.toX,
                fromZ: intersectArea.fromZ,
                toZ: newToZ,
                fromY: newToY,
                toY: newFromY
              })
              turnedOnCubeAreas.push({
                fromX: intersectArea.fromX,
                toX: intersectArea.toX,
                fromZ: newFromZ,
                toZ: intersectArea.toZ,
                fromY: newToY,
                toY: newFromY
              })
              turnedOnCubeAreas.push({
                fromX: intersectArea.fromX,
                toX: newToX,
                fromZ: newToZ,
                toZ: newFromZ,
                fromY: newToY,
                toY: newFromY
              })
              turnedOnCubeAreas.push({
                fromX: newToX,
                toX: intersectArea.toX,
                fromZ: newToZ,
                toZ: newFromZ,
                fromY: newToY,
                toY: newFromY
              })
            } else if(newFromX > newToX && newFromZ > newToZ) {
              turnedOnCubeAreas.push({
                fromX: intersectArea.fromX,
                toX: intersectArea.toX,
                fromZ: intersectArea.fromZ,
                toZ: intersectArea.toZ,
                fromY: newFromY,
                toY: newToY
              })
              turnedOnCubeAreas.push({
                fromX: intersectArea.fromX,
                toX: newToX,
                fromZ: intersectArea.fromZ,
                toZ: intersectArea.toZ,
                fromY: intersectArea.fromY === newFromY ? newToY : intersectArea.fromY,
                toY: intersectArea.fromY === newFromY ? intersectArea.toY : newFromY
              })
              turnedOnCubeAreas.push({
                fromX: newFromX,
                toX: intersectArea.toX,
                fromZ: intersectArea.fromZ,
                toZ: intersectArea.toZ,
                fromY: intersectArea.fromY === newFromY ? newToY : intersectArea.fromY,
                toY: intersectArea.fromY === newFromY ? intersectArea.toY : newFromY
              })
              turnedOnCubeAreas.push({
                fromX: newToX,
                toX: newFromX,
                fromZ: intersectArea.fromZ,
                toZ: newToZ,
                fromY: intersectArea.fromY === newFromY ? newToY : intersectArea.fromY,
                toY: intersectArea.fromY === newFromY ? intersectArea.toY : newFromY
              })
              turnedOnCubeAreas.push({
                fromX: newToX,
                toX: newFromX,
                fromZ: newFromZ,
                toZ: intersectArea.toZ,
                fromY: intersectArea.fromY === newFromY ? newToY : intersectArea.fromY,
                toY: intersectArea.fromY === newFromY ? intersectArea.toY : newFromY
              })
            } else if(newFromX > newToX) {
              console.log("X Intersecton with", newFromY > newToY, newFromZ > newToZ)
              turnedOnCubeAreas.push({
                fromX: intersectArea.fromX,
                toX: intersectArea.toX,
                fromZ: intersectArea.fromZ,
                toZ: intersectArea.toZ,
                fromY: newFromY,
                toY: newToY
              })
              turnedOnCubeAreas.push({
                fromX: intersectArea.fromX,
                toX: newToX,
                fromZ: intersectArea.fromZ,
                toZ: intersectArea.toZ,
                fromY: intersectArea.fromY === newFromY ? newToY : intersectArea.fromY,
                toY: intersectArea.fromY === newFromY ? intersectArea.toY : newFromY
              })
              turnedOnCubeAreas.push({
                fromX: newFromX,
                toX: intersectArea.toX,
                fromZ: intersectArea.fromZ,
                toZ: intersectArea.toZ,
                fromY: intersectArea.fromY === newFromY ? newToY : intersectArea.fromY,
                toY: intersectArea.fromY === newFromY ? intersectArea.toY : newFromY
              })
              turnedOnCubeAreas.push({
                fromX: newToX,
                toX: newFromX,
                fromZ: intersectArea.fromZ === newFromZ ? newToZ : intersectArea.fromZ,
                toZ: intersectArea.fromX === newFromZ ? intersectArea.toZ : newFromZ,
                fromY: intersectArea.fromY === newFromY ? newToY : intersectArea.fromY,
                toY: intersectArea.fromY === newFromY ? intersectArea.toY : newFromY
              })
            } else {
              console.error("Just partial within")
            }
          } else {
            intersectArea.fromX = newFromX;
            intersectArea.toX = newToX;
            intersectArea.fromY = newFromY;
            intersectArea.toY = newToY;
            intersectArea.fromZ = newFromZ;
            intersectArea.toZ = newToZ;
          }
        }
      }
    }
  }

  let litCubes: number = 0;

  for(let area of turnedOnCubeAreas) {
    if(area.fromX >= -50 && area.toX <= 50 && area.fromY >= -50 && area.toY <= 50 && area.fromZ >= -50 && area.toZ <= 50) {
      litCubes += Math.abs((area.toX - area.fromX)) * Math.abs((area.toY - area.fromY)) * Math.abs((area.toZ - area.fromZ));
    }
  }

  return litCubes
}

const goB = (input) => {
  return
}

/* Tests */

test(goA(prepareInput(readInputFromSpecialFile("testInput.txt"))), 590784)

/* Results */

console.time("Time")
//const resultA = goA(input)
const resultB = goB(input)
console.timeEnd("Time")

//console.log("Solution to part 1:", resultA)
console.log("Solution to part 2:", resultB)
