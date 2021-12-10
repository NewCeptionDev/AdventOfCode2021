import { readInput } from "../utils"
import { splitToLines } from "../utils/readInput"

const prepareInput = (rawInput: string) => rawInput

const input = prepareInput(readInput())

const mapToStackAndFindFirstIncorrectCharacter = (characters: string[]): { stack: string[], incorrectCharacter: string | undefined } => {
  const stack: string[] = []
  let incorrectCharacter: string | undefined = undefined

  for (let i = 0; i < characters.length && !incorrectCharacter; i++) {
    if (characters[i] === "(" || characters[i] === "[" || characters[i] === "{" || characters[i] === "<") {
      stack.push(characters[i])
    } else {
      switch (characters[i]) {
        case ")":
          if (stack.pop() !== "(") {
            incorrectCharacter = characters[i]
          }
          break
        case "]":
          if (stack.pop() !== "[") {
            incorrectCharacter = characters[i]
          }
          break
        case "}":
          if (stack.pop() !== "{") {
            incorrectCharacter = characters[i]
          }
          break
        case ">":
          if (stack.pop() !== "<") {
            incorrectCharacter = characters[i]
          }
          break
      }
    }
  }

  return { stack: stack, incorrectCharacter: incorrectCharacter }
}

const calculatePoints = (incorrectCharacters: Map<string, number>): number => {
  return Array.from(incorrectCharacters.keys()).map(key => {
    switch (key) {
      case ")":
        return 3 * incorrectCharacters.get(key)
      case "]":
        return 57 * incorrectCharacters.get(key)
      case "}":
        return 1197 * incorrectCharacters.get(key)
      case ">":
        return 25137 * incorrectCharacters.get(key)
    }
  }).reduce((previousValue, currentValue) => previousValue + currentValue, 0)
}

const goA = (input) => {
  const lines = splitToLines(input)

  const incorrectCharacters: Map<string, number> = new Map<string, number>()

  for (let line of lines) {
    const chars: string[] = Array.from(line)

    const { incorrectCharacter } = mapToStackAndFindFirstIncorrectCharacter(chars)

    if (incorrectCharacter) {
      incorrectCharacters.set(incorrectCharacter, incorrectCharacters.has(incorrectCharacter) ? incorrectCharacters.get(incorrectCharacter) + 1 : 1)
    }
  }

  return calculatePoints(incorrectCharacters)
}

const goB = (input) => {
  const lines = splitToLines(input)

  const pointsForLines: number[] = []

  for (let line of lines) {
    const chars: string[] = Array.from(line)
    let points: number = 0

    const { stack, incorrectCharacter } = mapToStackAndFindFirstIncorrectCharacter(chars)

    if (!incorrectCharacter) {
      while (stack.length > 0) {
        const toClose: string = stack.pop()
        points *= 5
        switch (toClose) {
          case "(":
            points += 1
            break
          case "[":
            points += 2
            break
          case "{":
            points += 3
            break
          case "<":
            points += 4
            break
        }
      }

      pointsForLines.push(points)
    }
  }

  const sortedPoints = pointsForLines.sort((a, b) => a - b)

  return sortedPoints[Math.floor(sortedPoints.length / 2)]
}

/* Tests */

// test()

/* Results */

console.time("Time")
const resultA = goA(input)
const resultB = goB(input)
console.timeEnd("Time")

console.log("Solution to part 1:", resultA)
console.log("Solution to part 2:", resultB)
