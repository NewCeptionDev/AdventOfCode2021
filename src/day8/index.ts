import { test, readInput } from "../utils"
import { readInputFromSpecialFile } from "../utils/readInput"

const prepareInput = (rawInput: string) => rawInput

const input = prepareInput(readInput())

enum Segment {
  A,
  B,
  C,
  D,
  E,
  F,
  G
}

interface Display {
  uniquePattern: Segment[][],
  outputPattern: Segment[][],
  segmentMapping: Segment[][]
}

const parsePatternToSegments = (pattern: string): Segment[] => {
  return Array.from(pattern).filter(value => value !== "").map(value => {
    switch (value) {
      case "a":
        return Segment.A
      case "b":
        return Segment.B
      case "c":
        return Segment.C
      case "d":
        return Segment.D
      case "e":
        return Segment.E
      case "f":
        return Segment.F
      case "g":
        return Segment.G
    }
  })
}

const parseDisplay = (line: string): Display => {
  const splitByDelimiter = line.split("|")

  return {
    uniquePattern: splitByDelimiter[0].split(" ").filter(value => value !== "").map(value => parsePatternToSegments(value)),
    outputPattern: splitByDelimiter[1].split(" ").filter(value => value !== "").map(value => parsePatternToSegments(value)),
    segmentMapping: [],
  }
}

const findSegmentMapping = (display: Display) => {
  const onePattern = display.uniquePattern.find(pattern => pattern.length == 2);
  const sevenPattern = display.uniquePattern.find(pattern => pattern.length == 3);
  const fourPattern = display.uniquePattern.find(pattern => pattern.length == 4);
  const eightPattern = display.uniquePattern.find(pattern => pattern.length == 7);
  const zeroPattern = display.uniquePattern.find(pattern => pattern.length == 6 && fourPattern.some(value => !pattern.includes(value)) && onePattern.every(value => pattern.includes(value)));
  const sixPattern = display.uniquePattern.find(pattern => pattern.length == 6 && fourPattern.some(value => !pattern.includes(value)) && onePattern.some(value => !pattern.includes(value)));
  const ninePattern = display.uniquePattern.find(pattern => pattern.length == 6 && fourPattern.every(value => pattern.includes(value)) && onePattern.every(value => pattern.includes(value)));
  const fivePattern = display.uniquePattern.find(pattern => pattern.length == 5 && pattern.every(value => ninePattern.includes(value)) && onePattern.some(value => !pattern.includes(value)));
  const twoPattern = display.uniquePattern.find(pattern => pattern.length == 5 && pattern.some(value => !ninePattern.includes(value)) && onePattern.some(value => !pattern.includes(value)));
  const threePattern = display.uniquePattern.find(pattern => pattern.length == 5 && pattern.every(value => ninePattern.includes(value)) && onePattern.every(value => pattern.includes(value)));

  display.segmentMapping.push(zeroPattern);
  display.segmentMapping.push(onePattern);
  display.segmentMapping.push(twoPattern);
  display.segmentMapping.push(threePattern);
  display.segmentMapping.push(fourPattern);
  display.segmentMapping.push(fivePattern);
  display.segmentMapping.push(sixPattern);
  display.segmentMapping.push(sevenPattern);
  display.segmentMapping.push(eightPattern);
  display.segmentMapping.push(ninePattern);
}

const goA = (input) => {
  const lines = input.split("\r\n").filter(line => line !== "")

  const displays: Display[] = []

  for (let line of lines) {
    displays.push(parseDisplay(line))
  }

  const outputDigits: Map<number, number> = new Map<number, number>();

  displays.forEach(display => {
    findSegmentMapping(display);
    for(let pattern of display.outputPattern) {
      const outputDigit: number = display.segmentMapping.indexOf(display.segmentMapping.find(mapping => mapping.every(value => pattern.includes(value)) && mapping.length === pattern.length))

      outputDigits.set(outputDigit, outputDigits.has(outputDigit) ? outputDigits.get(outputDigit) + 1 : 1);
    }
  })

  return outputDigits.get(1) + outputDigits.get(4) + outputDigits.get(7) + outputDigits.get(8)
}

const goB = (input) => {
  const lines = input.split("\r\n").filter(line => line !== "")

  const displays: Display[] = []

  for (let line of lines) {
    displays.push(parseDisplay(line))
  }

  let sumOverAllDisplays: number = 0;

  displays.forEach(display => {
    findSegmentMapping(display);
    let digitOutput: string = "";
    for(let pattern of display.outputPattern) {
      const outputDigit: number = display.segmentMapping.indexOf(display.segmentMapping.find(mapping => mapping.every(value => pattern.includes(value)) && mapping.length === pattern.length))

      digitOutput += outputDigit.toString();
    }
    sumOverAllDisplays += parseInt(digitOutput);
  })

  return sumOverAllDisplays
}

/* Tests */

test(goA(prepareInput(readInputFromSpecialFile("testInput.txt"))), 26)

/* Results */

console.time("Time")
const resultA = goA(input)
const resultB = goB(input)
console.timeEnd("Time")

console.log("Solution to part 1:", resultA)
console.log("Solution to part 2:", resultB)
