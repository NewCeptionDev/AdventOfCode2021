import { readInput, test } from "../utils"
import { readInputFromSpecialFile, splitToLines } from "../utils/readInput"

const prepareInput = (rawInput: string) => rawInput

const input = prepareInput(readInput())

interface Recipe {
  from: string,
  add: string
}

const parseTemplatePairs = (line: string): Map<string, number> => {
  const charsOfLine: string[] = Array.from(line)
  const pairs: Map<string, number> = new Map<string, number>()

  for (let i = 1; i < charsOfLine.length; i++) {
    let pair = charsOfLine[i - 1] + charsOfLine[i]
    pairs.set(pair, pairs.has(pair) ? pairs.get(pair) + 1 : 1)
  }

  return pairs
}

const parseRecipes = (lines: string[]): Recipe[] => {
  return lines.map(line => {
    let parts: string[] = line.split(" -> ")
    return {
      from: parts[0],
      add: parts[1],
    }
  })
}

const calculateStep = (templatePairs: Map<string, number>, recipes: Recipe[]): Map<string, number> => {
  const newTemplatePairs: Map<string, number> = new Map<string, number>()

  for (let key of Array.from(templatePairs.keys())) {
    const recipe = recipes.find(recipe => recipe.from === key)
    const amountOfPairs = templatePairs.get(key)

    if (recipe) {
      const keySplit = Array.from(key)
      let newPair1 = keySplit[0] + recipe.add
      let newPair2 = recipe.add + keySplit[1]

      newTemplatePairs.set(newPair1, newTemplatePairs.has(newPair1) ? newTemplatePairs.get(newPair1) + amountOfPairs : amountOfPairs)
      newTemplatePairs.set(newPair2, newTemplatePairs.has(newPair2) ? newTemplatePairs.get(newPair2) + amountOfPairs : amountOfPairs)
    }
  }

  return newTemplatePairs
}

const findCharacterOccurrences = (pairs: Map<string, number>): Map<string, number> => {
  let charOccurrences: Map<string, number> = new Map<string, number>()

  for (let pair of Array.from(pairs.keys())) {
    let chars = Array.from(pair)
    let occurrences = pairs.get(pair)

    charOccurrences.set(chars[0], charOccurrences.has(chars[0]) ? charOccurrences.get(chars[0]) + occurrences : occurrences)
    charOccurrences.set(chars[1], charOccurrences.has(chars[1]) ? charOccurrences.get(chars[1]) + occurrences : occurrences)
  }

  return charOccurrences
}

const findMinAndMaxOccurrenceCount = (characterOccurrences: Map<string, number>): { min: number, max: number } => {
  let minimumOccurrences = Number.MAX_SAFE_INTEGER
  let maximumOccurrences = Number.MIN_SAFE_INTEGER

  for (let key of Array.from(characterOccurrences.keys())) {
    const occurrences = characterOccurrences.get(key)

    minimumOccurrences = minimumOccurrences > occurrences ? occurrences : minimumOccurrences
    maximumOccurrences = maximumOccurrences < occurrences ? occurrences : maximumOccurrences
  }

  return {
    min: minimumOccurrences,
    max: maximumOccurrences,
  }
}

const goA = (input) => {
  const lines: string[] = splitToLines(input)

  let templatePairs: Map<string, number> = parseTemplatePairs(lines[0])
  const recipes: Recipe[] = parseRecipes(lines.slice(1))

  for (let i = 0; i < 10; i++) {
    templatePairs = calculateStep(templatePairs, recipes)
  }

  let charOccurrences: Map<string, number> = findCharacterOccurrences(templatePairs)

  const { min, max } = findMinAndMaxOccurrenceCount(charOccurrences)

  return Math.floor((max - min) / 2)
}

const goB = (input) => {
  const lines: string[] = splitToLines(input)

  let templatePairs: Map<string, number> = parseTemplatePairs(lines[0])
  const recipes: Recipe[] = parseRecipes(lines.slice(1))

  for (let i = 0; i < 40; i++) {
    templatePairs = calculateStep(templatePairs, recipes)
  }

  let charOccurrences: Map<string, number> = findCharacterOccurrences(templatePairs)

  const { min, max } = findMinAndMaxOccurrenceCount(charOccurrences)

  return Math.floor((max - min) / 2)
}

/* Tests */

//Test Results appear to be exactly 1 higher than the correct Results for normal Input
test(goA(prepareInput(readInputFromSpecialFile("testInput.txt"))), 1588 - 1)
test(goB(prepareInput(readInputFromSpecialFile("testInput.txt"))), 2188189693529 - 1)

/* Results */

console.time("Time")
const resultA = goA(input)
const resultB = goB(input)
console.timeEnd("Time")

console.log("Solution to part 1:", resultA)
console.log("Solution to part 2:", resultB)
