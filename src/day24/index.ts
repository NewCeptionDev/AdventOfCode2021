import { readInput, test } from "../utils"
import { splitToLines } from "../utils/readInput"

const prepareInput = (rawInput: string) => rawInput

const input = prepareInput(readInput())

enum OPERATION {
  INP,
  ADD,
  MUL,
  DIV,
  MOD,
  EQL
}

enum VARIABLE {
  W,
  X,
  Y,
  Z
}

interface Instruction {
  operation: OPERATION,
  operand1: VARIABLE,
  operand2?: VARIABLE,
  value?: number
}

const parseStringToOperation = (value: string): OPERATION => {
  switch (value) {
    case "inp":
      return OPERATION.INP
    case "add":
      return OPERATION.ADD
    case "mul":
      return OPERATION.MUL
    case "div":
      return OPERATION.DIV
    case "mod":
      return OPERATION.MOD
    case "eql":
      return OPERATION.EQL
  }
}

const parseVariable = (value: string): VARIABLE => {
  switch (value) {
    case "w":
      return VARIABLE.W
    case "x":
      return VARIABLE.X
    case "y":
      return VARIABLE.Y
    case "z":
      return VARIABLE.Z
  }
}

const parseInstruction = (line: string): Instruction => {
  const parts = line.split(" ")

  return {
    operation: parseStringToOperation(parts[0]),
    operand1: parseVariable(parts[1]),
    operand2: Number.isNaN(parseInt(parts[2])) ? parseVariable(parts[2]) : undefined,
    value: Number.isNaN(parseInt(parts[2])) ? undefined : parseInt(parts[2]),
  }
}

const reduceStates = (states: {}) => {
  const temp: object = {}
  for (let state of Object.keys(states)) {
    if (temp[states[state]] === undefined || parseInt(temp[states[state]]) < parseInt(state)) {
      temp[states[state]] = state
    }
  }

  const temp2: object = {}
  for (let key of Object.keys(temp)) {
    temp2[temp[key]] = key.split(",").map(value => parseInt(value))
  }

  return temp2
}

const applyInstructionsToInputs = (instructions: Instruction[], currentAluStates: object): object => {
  let numbersDone: number = 0
  for (let i = 0; i < instructions.length; i++) {
    const instruction = instructions[i]

    const currentStateKeys = Object.keys(currentAluStates)
    //console.log("Applying Instruction", instruction, currentAluStates)
    switch (instruction.operation) {
      case OPERATION.INP:
        console.log("New Inp Operation")
        console.log("Numbers done:", numbersDone)
        numbersDone++
        currentAluStates = reduceStates(currentAluStates)
        const toAdd = {}
        for (let values of Object.keys(currentAluStates)) {
          for (let i = 1; i <= 9; i++) {
            const newValue = currentAluStates[values].slice(0)
            newValue[instruction.operand1] = i

            toAdd[values + i] = newValue
          }
        }
        currentAluStates = reduceStates(toAdd)
        console.log("Current States", Object.keys(currentAluStates).length)
        break
      case OPERATION.ADD:
        for (let values of currentStateKeys) {
          if (instruction.operand2 !== undefined) {
            currentAluStates[values][instruction.operand1] = currentAluStates[values][instruction.operand1] + currentAluStates[values][instruction.operand2]
          } else {
            currentAluStates[values][instruction.operand1] = currentAluStates[values][instruction.operand1] + instruction.value
          }
        }
        break
      case OPERATION.MUL:
        for (let values of currentStateKeys) {
          if (instruction.operand2 !== undefined) {
            currentAluStates[values][instruction.operand1] = currentAluStates[values][instruction.operand1] * currentAluStates[values][instruction.operand2]
          } else {
            currentAluStates[values][instruction.operand1] = currentAluStates[values][instruction.operand1] * instruction.value
          }
        }
        break
      case OPERATION.DIV:
        for (let values of currentStateKeys) {
          if (instruction.operand2 !== undefined) {
            if (currentAluStates[values][instruction.operand2] === 0) {
              delete currentAluStates[values]
            } else {
              currentAluStates[values][instruction.operand1] = Math.floor(currentAluStates[values][instruction.operand1] / currentAluStates[values][instruction.operand2])
            }
          } else {
            if (instruction.value === 0) {
              delete currentAluStates[values]
            } else {
              currentAluStates[values][instruction.operand1] = Math.floor(currentAluStates[values][instruction.operand1] / instruction.value)
            }
          }
        }
        break
      case OPERATION.MOD:
        for (let values of currentStateKeys) {
          if (currentAluStates[values][instruction.operand1] < 0) {
            delete currentAluStates[values]
          }
          if (instruction.operand2) {
            if (currentAluStates[values][instruction.operand2] <= 0) {
              delete currentAluStates[values]
            }
            currentAluStates[values][instruction.operand1] = currentAluStates[values][instruction.operand1] % currentAluStates[values][instruction.operand2]
          } else {
            if (instruction.value <= 0) {
              delete currentAluStates[values]
            }
            currentAluStates[values][instruction.operand1] = currentAluStates[values][instruction.operand1] % instruction.value

          }
        }
        break
      case OPERATION.EQL:
        for (let values of currentStateKeys) {
          if (instruction.operand2 !== undefined) {
            currentAluStates[values][instruction.operand1] = currentAluStates[values][instruction.operand1] === currentAluStates[values][instruction.operand2] ? 1 : 0
          } else {
            currentAluStates[values][instruction.operand1] = currentAluStates[values][instruction.operand1] === instruction.value ? 1 : 0
          }
        }
        break
    }
  }

  return currentAluStates
}

const goA = (input) => {
  const lines: string[] = splitToLines(input)

  const instructions: Instruction[] = lines.map(line => parseInstruction(line))

  const possibleAluStates: number[][] = [[0, 0, 0, 0]]

  const states: object = applyInstructionsToInputs(instructions, possibleAluStates)

  let largestNumber: number = Number.MIN_SAFE_INTEGER

  for (let state of Object.keys(states)) {
    if (states[state][VARIABLE.Z] === 0 && parseInt(state) < largestNumber) {
      largestNumber = parseInt(state)
    }

  }

  return largestNumber
}

const goB = (input) => {
  return
}

/* Tests */

test(reduceStates({ "32": [1, 2, 3, 5], "4": [3], "12": [1, 2, 3, 5], "231": [3] }), { "32": [1, 2, 3, 5], "231": [3] })

/* Results */

console.time("Time")
const resultA = goA(input)
const resultB = goB(input)
console.timeEnd("Time")

console.log("Solution to part 1:", resultA)
console.log("Solution to part 2:", resultB)
