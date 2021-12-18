import { readInput, test } from "../utils"
import { readInputFromSpecialFile, splitToLines } from "../utils/readInput"

const prepareInput = (rawInput: string) => rawInput

const input = prepareInput(readInput())

interface SnailfishPair {
  leftPart: number | SnailfishPair;
  rightPart: number | SnailfishPair;
}

enum ACTION {
  EXPLODE,
  SPLIT
}

interface IntermediateResult {
  reducedPair: SnailfishPair | number,
  actionApplied: boolean,
  valueToApplyLeft: number | undefined,
  valueToApplyRight: number | undefined
}

const parseSnailfishPair = (line: string, startIndex: number): { pair: SnailfishPair, lastIndex: number } => {
  const chars = Array.from(line)

  let currentIndex: number = startIndex + 1
  let leftPart: number | SnailfishPair = undefined
  let rightPart: number | SnailfishPair = undefined

  for (let i = 0; i < 2; i++) {
    if (chars[currentIndex] === "[") {
      const { pair, lastIndex } = parseSnailfishPair(line, currentIndex)
      if (i === 0) {
        leftPart = pair
      } else {
        rightPart = pair
      }
      currentIndex = lastIndex + 1
    } else {
      const partSplit = chars.indexOf(i == 0 ? "," : "]", currentIndex)
      if (i == 0) {
        leftPart = parseInt(line.slice(currentIndex, partSplit))
      } else {
        rightPart = parseInt(line.slice(currentIndex, partSplit))
      }
      currentIndex = partSplit + 1
    }
  }

  return {
    pair: {
      leftPart: leftPart,
      rightPart: rightPart,
    },
    lastIndex: currentIndex,
  }
}

const isNumber = (object: any): object is Number => {
  if (object === undefined) {
    return false
  }

  return typeof object === "number"
}

const applyValueToNearestLeftValue = (value: number, pair: SnailfishPair): SnailfishPair => {
  if (!isNumber(pair.rightPart)) {
    pair.rightPart = applyValueToNearestLeftValue(value, pair.rightPart)
  } else {
    pair.rightPart += value
  }

  return pair
}

const applyValueToNearestRightValue = (value: number, pair: SnailfishPair): SnailfishPair => {
  if (!isNumber(pair.leftPart)) {
    pair.leftPart = applyValueToNearestRightValue(value, pair.leftPart)
  } else {
    pair.leftPart += value
  }

  return pair
}

const findAndApplyAction = (pair: SnailfishPair, depth: number, action: ACTION): IntermediateResult => {
  let actionWasApplied: boolean = false
  let valueToBeAppliedLeft: number = undefined
  let valueToBeAppliedRight: number = undefined

  if (!isNumber(pair.leftPart)) {
    const {
      reducedPair,
      actionApplied,
      valueToApplyLeft,
      valueToApplyRight,
    } = findAndApplyAction(pair.leftPart, depth + 1, action)
    pair.leftPart = reducedPair
    actionWasApplied = actionApplied
    valueToBeAppliedLeft = valueToApplyLeft
    valueToBeAppliedRight = valueToApplyRight
  }

  if (actionWasApplied) {
    if (valueToBeAppliedRight !== undefined) {
      if (!isNumber(pair.rightPart)) {
        pair.rightPart = applyValueToNearestRightValue(valueToBeAppliedRight, pair.rightPart)
      } else {
        pair.rightPart += valueToBeAppliedRight
      }
    }

    return {
      reducedPair: pair,
      actionApplied: actionWasApplied,
      valueToApplyLeft: valueToBeAppliedLeft,
      valueToApplyRight: undefined,
    }
  }

  if (action === ACTION.EXPLODE) {
    if (depth > 4) {
      return {
        reducedPair: 0,
        actionApplied: true,
        valueToApplyLeft: !isNumber(pair.leftPart) ? undefined : pair.leftPart,
        valueToApplyRight: !isNumber(pair.rightPart) ? undefined : pair.rightPart,
      }
    }
  }

  if (action === ACTION.SPLIT) {
    if (isNumber(pair.leftPart) && pair.leftPart >= 10) {
      return {
        reducedPair: {
          leftPart: {
            leftPart: !isNumber(pair.leftPart) ? undefined : Math.floor(pair.leftPart / 2),
            rightPart: !isNumber(pair.leftPart) ? undefined : Math.round(pair.leftPart / 2),
          },
          rightPart: pair.rightPart,
        },
        actionApplied: true,
        valueToApplyLeft: undefined,
        valueToApplyRight: undefined,
      }
    }
  }

  if (!isNumber(pair.rightPart)) {
    const {
      reducedPair,
      actionApplied,
      valueToApplyLeft,
      valueToApplyRight,
    } = findAndApplyAction(pair.rightPart, depth + 1, action)
    pair.rightPart = reducedPair
    actionWasApplied = actionApplied
    valueToBeAppliedLeft = valueToApplyLeft
    valueToBeAppliedRight = valueToApplyRight
  }

  if (actionWasApplied) {
    if (valueToBeAppliedLeft !== undefined) {
      if (!isNumber(pair.leftPart)) {
        pair.leftPart = applyValueToNearestLeftValue(valueToBeAppliedLeft, pair.leftPart)
      } else {
        pair.leftPart += valueToBeAppliedLeft
      }
    }

    return {
      reducedPair: pair,
      actionApplied: actionWasApplied,
      valueToApplyLeft: undefined,
      valueToApplyRight: valueToBeAppliedRight,
    }
  }

  if (action === ACTION.SPLIT) {
    if (isNumber(pair.rightPart) && pair.rightPart >= 10) {
      return {
        reducedPair: {
          leftPart: pair.leftPart,
          rightPart: {
            leftPart: !isNumber(pair.rightPart) ? undefined : Math.floor(pair.rightPart / 2),
            rightPart: !isNumber(pair.rightPart) ? undefined : Math.round(pair.rightPart / 2),
          },
        },
        actionApplied: true,
        valueToApplyLeft: undefined,
        valueToApplyRight: undefined,
      }
    }
  }

  return {
    reducedPair: pair,
    actionApplied: false,
    valueToApplyLeft: undefined,
    valueToApplyRight: undefined,
  }
}

const reduceSnailfishPair = (pair: SnailfishPair): SnailfishPair | number => {
  let intermediateReduceResult: IntermediateResult = findAndApplyAction(pair, 1, ACTION.EXPLODE)

  while (intermediateReduceResult.actionApplied) {
    intermediateReduceResult = findAndApplyAction(pair, 1, ACTION.EXPLODE)
  }

  intermediateReduceResult = findAndApplyAction(pair, 1, ACTION.SPLIT)

  if (intermediateReduceResult.actionApplied && !isNumber(intermediateReduceResult.reducedPair)) {
    return reduceSnailfishPair(intermediateReduceResult.reducedPair)
  }

  return intermediateReduceResult.reducedPair
}

const addSnailfishPairs = (pair1: SnailfishPair | number, pair2: SnailfishPair | number): SnailfishPair | number => {
  const addedSnailfishPair: SnailfishPair = {
    leftPart: pair1,
    rightPart: pair2,
  }

  return reduceSnailfishPair(addedSnailfishPair)
}

const stringifySnailfishPair = (pair: SnailfishPair | number): string => {
  if (isNumber(pair)) {
    return pair.toString()
  }

  let result: string = "["

  if (!isNumber(pair.leftPart)) {
    result += stringifySnailfishPair(pair.leftPart)
  } else {
    result += pair.leftPart.toString()
  }

  result += ", "

  if (!isNumber(pair.rightPart)) {
    result += stringifySnailfishPair(pair.rightPart)
  } else {
    result += pair.rightPart.toString()
  }

  result += "]"

  return result
}

const calculateMagnitude = (pair: SnailfishPair | number) => {
  if (isNumber(pair)) {
    return pair
  } else {
    return 3 * calculateMagnitude(pair.leftPart) + 2 * calculateMagnitude(pair.rightPart)
  }
}

const goA = (input) => {
  const lines = splitToLines(input)
  const snailfishPairs: SnailfishPair[] = lines.map(line => parseSnailfishPair(line, 0).pair)

  const endResult = snailfishPairs.reduce((previousValue, currentValue) => {
    let result: SnailfishPair | number = addSnailfishPairs(previousValue, currentValue)
    return !isNumber(result) ? result : undefined
  })

  return calculateMagnitude(endResult)
}

const goB = (input) => {
  const lines = splitToLines(input)
  let snailfishPairs: SnailfishPair[] = lines.map(line => parseSnailfishPair(line, 0).pair)

  const magnitudesOfSums: number[] = []

  for (let first = 0; first < snailfishPairs.length; first++) {
    for (let second = 0; second < snailfishPairs.length; second++) {
      if (first !== second) {
        magnitudesOfSums.push(calculateMagnitude(addSnailfishPairs(snailfishPairs[first], snailfishPairs[second])))
        snailfishPairs = lines.map(line => parseSnailfishPair(line, 0).pair)
      }
    }
  }

  const sorted: number[] = magnitudesOfSums.sort((a, b) => a - b)

  return sorted[sorted.length - 1]
}

/* Tests */

test(goA(prepareInput(readInputFromSpecialFile("testInput.txt"))), 4140)
test(goB(prepareInput(readInputFromSpecialFile("testInput.txt"))), 3993)

/* Results */

console.time("Time")
const resultA = goA(input)
const resultB = goB(input)
console.timeEnd("Time")

console.log("Solution to part 1:", resultA)
console.log("Solution to part 2:", resultB)
