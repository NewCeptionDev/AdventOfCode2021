import { test, readInput } from "../utils"
import { readInputFromSpecialFile } from "../utils/readInput"

const prepareInput = (rawInput: string) => rawInput

const input = prepareInput(readInput())

interface Position {
  x: number;
  y: number;
}

const parseArea = (lines: string[]): number[][] => {
  const area: number[][] = []

  for (let line of lines) {
    area.push(Array.from(line).filter(value => value.length >= 1).map(value => parseInt(value)))
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

  if (position.y > 0) {
    neighbourPositions.push({ x: position.x, y: position.y - 1 })
  }

  if (position.y < maxY - 1) {
    neighbourPositions.push({ x: position.x, y: position.y + 1 })
  }

  return neighbourPositions
}

const findLowPoints = (area: number[][]): Map<Position, number> => {
  const lowPoints: Map<Position, number> = new Map<Position, number>()

  for (let y = 0; y < area.length; y++) {
    for (let x = 0; x < area[y].length; x++) {
      const neighbourPositions = getNeighbourPositions({ x: x, y: y }, area[y].length, area.length)

      if (neighbourPositions.every(position => area[position.y][position.x] > area[y][x])) {
        lowPoints.set({ x: x, y: y }, area[y][x])
      }
    }
  }

  return lowPoints
}

const calculateBasinSize = (area: number[][], position: Position, visitedPositions: Position[]): { basinSize: number, visitedPositions: Position[] } => {
  let neighbourPositions = getNeighbourPositions(position, area[position.y].length, area.length)

  neighbourPositions = neighbourPositions.filter(neighbourPosition => visitedPositions.every(visitedPosition => neighbourPosition.x !== visitedPosition.x || neighbourPosition.y !== visitedPosition.y)).filter(neighbourPosition => area[neighbourPosition.y][neighbourPosition.x] > area[position.y][position.x] && area[neighbourPosition.y][neighbourPosition.x] !== 9)

  let basinSize = neighbourPositions.length;

  for (let neighbourPosition of neighbourPositions) {
    if(visitedPositions.every(visitedPosition => neighbourPosition.x !== visitedPosition.x || neighbourPosition.y !== visitedPosition.y)) {
      visitedPositions.push(neighbourPosition)
      const result = calculateBasinSize(area, neighbourPosition, visitedPositions)
      basinSize += result.basinSize
      visitedPositions = result.visitedPositions
    } else {
      basinSize -= 1;
    }
  }

  return {basinSize: basinSize, visitedPositions: visitedPositions}
}

const getSmallestElementIndex = (array: number[]): number => {
  let smallestElement = Number.MAX_SAFE_INTEGER;

  for(let element of array) {
    if(smallestElement > element){
      smallestElement = element;
    }
  }

  return array.indexOf(smallestElement);
}

const goA = (input) => {
  const lines = input.split("\n").filter(line => line !== "")

  const area: number[][] = parseArea(lines)

  return Array.from(findLowPoints(area).values()).map(value => value + 1).reduce((previousValue, currentValue) => previousValue + currentValue, 0)
}

const goB = (input) => {
  const lines = input.split("\n").filter(line => line !== "")

  const area: number[][] = parseArea(lines)

  const lowPoints = findLowPoints(area);

  const basinSizes: number[] = Array.from(lowPoints.keys()).map(position =>  calculateBasinSize(area, position, [position]).basinSize + 1);

  const largestBasinSizes: number[] = [];

  for(let size of basinSizes) {
    if(largestBasinSizes.length < 3) {
      largestBasinSizes.push(size);
    } else {
      const smallestElementIndex = getSmallestElementIndex(largestBasinSizes);

      if(size > largestBasinSizes[smallestElementIndex]) {
        largestBasinSizes[smallestElementIndex] = size;
      }
    }
  }

  return largestBasinSizes.reduce((previousValue, currentValue) => previousValue * currentValue, 1)
}

/* Tests */

test(goA(prepareInput(readInputFromSpecialFile("testInput.txt"))), 15)
test(goB(prepareInput(readInputFromSpecialFile("testInput.txt"))), 1134)

/* Results */

console.time("Time")
const resultA = goA(input)
const resultB = goB(input)
console.timeEnd("Time")

console.log("Solution to part 1:", resultA)
console.log("Solution to part 2:", resultB)
