import { readInput, test } from "../utils"
import { readInputFromSpecialFile, splitToLines } from "../utils/readInput"

const prepareInput = (rawInput: string) => rawInput

const input = prepareInput(readInput())

const enum CAVE_SIZE {
  SMALL,
  LARGE
}

interface Cave {
  size: CAVE_SIZE,
  identifier: string,
  routesFromCave: Cave[]
}

const parseCaves = (lines: string[]): Map<string, Cave> => {
  let caves: Map<string, Cave> = new Map<string, Cave>()

  for (let line of lines) {
    const parts = line.split("-")

    let fromCave: Cave = caves.get(parts[0])
    let toCave: Cave = caves.get(parts[1])

    if (!fromCave) {
      fromCave = {
        identifier: parts[0],
        size: parts[0].toUpperCase() === parts[0] ? CAVE_SIZE.LARGE : CAVE_SIZE.SMALL,
        routesFromCave: [],
      }

      caves.set(fromCave.identifier, fromCave)
    }

    if (!toCave) {
      toCave = {
        identifier: parts[1],
        size: parts[1].toUpperCase() === parts[1] ? CAVE_SIZE.LARGE : CAVE_SIZE.SMALL,
        routesFromCave: [],
      }

      caves.set(toCave.identifier, toCave)
    }

    fromCave.routesFromCave.push(toCave)
    toCave.routesFromCave.push(fromCave)
  }

  return caves
}

const findPath = (startCave: Cave, currentPath: Cave[], visitationPredicate: Function): Cave[][] => {
  let paths: Cave[][] = []

  currentPath = Array.from(currentPath)
  currentPath.push(startCave)

  if (startCave.identifier === "end") {
    return [currentPath]
  }

  for (let route of startCave.routesFromCave) {
    if (route.size === CAVE_SIZE.LARGE || visitationPredicate(currentPath, route)) {
      paths.push(...findPath(route, currentPath, visitationPredicate))
    }
  }

  return paths
}

const isSmallCasedVisitedTwice = (path: Cave[]): boolean => {
  return path.filter(cave => cave.size === CAVE_SIZE.SMALL).some(cave => path.indexOf(cave) !== path.lastIndexOf(cave))
}

const goA = (input) => {
  const lines: string[] = splitToLines(input)
  const caves: Map<string, Cave> = parseCaves(lines)
  const paths: Cave[][] = findPath(caves.get("start"), [], (path: Cave[], route: Cave) => !path.includes(route))

  return paths.length
}

const goB = (input) => {
  const lines: string[] = splitToLines(input)
  const caves: Map<string, Cave> = parseCaves(lines)
  const paths: Cave[][] = findPath(caves.get("start"), [], (path: Cave[], route: Cave) => !path.includes(route) || (route.identifier !== "start" && !isSmallCasedVisitedTwice(path)))

  return paths.length
}

/* Tests */

test(goA(prepareInput(readInputFromSpecialFile("testInput.txt"))), 10)
test(goB(prepareInput(readInputFromSpecialFile("testInput.txt"))), 36)

/* Results */

console.time("Time")
const resultA = goA(input)
const resultB = goB(input)
console.timeEnd("Time")

console.log("Solution to part 1:", resultA)
console.log("Solution to part 2:", resultB)
