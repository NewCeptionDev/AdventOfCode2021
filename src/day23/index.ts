import { readInput, test } from "../utils"
import { readInputFromSpecialFile, splitToLines } from "../utils/readInput"

const prepareInput = (rawInput: string) => rawInput

const input = prepareInput(readInput())

const getFirstPieceFromRoom = (room: string) => {
  return Array.from(room).find(piece => piece !== ".")
}

const isPieceInGoalSpace = (position: number): boolean => {
  return position === 2 || position == 4 || position == 6 || position == 8
}

const getGoalRoomPositionForPiece = (piece: string): number => {
  switch (piece) {
    case "A":
      return 2
    case "B":
      return 4
    case "C":
      return 6
    case "D":
      return 8
  }
}

const getMoveCostsOfPiece = (piece: string): number => {
  switch (piece) {
    case "A":
      return 1
    case "B":
      return 10
    case "C":
      return 100
    case "D":
      return 1000
  }
}

const roomContainsOnlyGoalPieces = (board: string[], goalPiece: string, goalPiecePosition: number): boolean => {
  const room: string = board[goalPiecePosition]

  return room.length === Array.from(room).filter(piece => piece === "." || piece === goalPiece).length
}

const canPieceReachPosition = (board: string[], startPosition: number, destination: number): boolean => {
  const minimum = Math.min(startPosition, destination)
  const maximum = Math.max(startPosition, destination)

  let canReach: boolean = true

  for (let i = minimum; i <= maximum && canReach; i++) {
    if (!isPieceInGoalSpace(i) && i !== startPosition && board[i] !== ".") {
      return false
    }
    //if(i == startPosition) {
    //  continue;
    //}
    //if(isPieceInGoalSpace(startPosition)) {
    //  continue;
    //}
    //if(board[i] !== ".") {
    //  return false;
    //}
  }

  return true
}

const getAllPossibleMoves = (board: string[], position: number): number[] => {
  const currentPiece: string = board[position]

  if (!isPieceInGoalSpace(position)) {
    if (canPieceReachPosition(board, position, getGoalRoomPositionForPiece(currentPiece)) && roomContainsOnlyGoalPieces(board, currentPiece, getGoalRoomPositionForPiece(currentPiece))) {
      return [getGoalRoomPositionForPiece(currentPiece)]
    }
    return []
  }

  const movingLetter = getFirstPieceFromRoom(currentPiece)

  if (getGoalRoomPositionForPiece(movingLetter) === position && roomContainsOnlyGoalPieces(board, movingLetter, position)) {
    return []
  }

  const possibleMoves: number[] = []
  for (let i = 0; i < board.length; i++) {
    if (i !== position && (!isPieceInGoalSpace(i) || getGoalRoomPositionForPiece(movingLetter) === i) && (getGoalRoomPositionForPiece(movingLetter) !== i || roomContainsOnlyGoalPieces(board, movingLetter, i))) {
      if (canPieceReachPosition(board, position, i)) {
        possibleMoves.push(i)
      }
    }
    //if(position === i) {
    //  continue;
    //}
    //if(isPieceInGoalSpace(i) && getGoalRoomPositionForPiece(movingLetter) !== i) {
    //  continue;
    //}
    //if(getGoalRoomPositionForPiece(movingLetter) === i) {
    //  if(!roomContainsOnlyGoalPieces(board, movingLetter, i)) {
    //    continue;
    //  }
    //}
    //if(canPieceReachPosition(board, position, i)) {
    //  possibleMoves.push(i);
    //}
  }

  return possibleMoves
}

const addPieceToRoom = (letter: string, room: string): { room: string, distance: number } => {
  const charsOfRoom = Array.from(room)
  const distance = charsOfRoom.filter(char => char === ".").length
  if (distance === 0) {
    console.error("Distance is 0 but should not be")
  }
  charsOfRoom[distance - 1] = letter
  return { room: charsOfRoom.toString().replace(/,/g, ""), distance: distance }
}

const movePiece = (board: string[], position: number, destination: number): { newBoard: string[], cost: number } => {
  const newBoard: string[] = board.slice(0)
  const movingLetter: string = getFirstPieceFromRoom(board[position])
  let distance: number = 0

  if (board[position].length === 1) {
    newBoard[position] = "."
  } else {
    let newRoom = ""
    let replacedTakenChar: boolean = false

    for (let char of Array.from(board[position])) {
      if (char === ".") {
        distance += 1
        newRoom += "."
      } else {
        if (!replacedTakenChar) {
          replacedTakenChar = true
          distance += 1
          newRoom += "."
        } else {
          newRoom += char
        }
      }
    }
    newBoard[position] = newRoom
  }

  distance += Math.abs(position - destination)

  if (board[destination].length === 1) {
    newBoard[destination] = movingLetter
  } else {
    const updatedRoom = addPieceToRoom(movingLetter, board[destination])
    newBoard[destination] = updatedRoom.room
    distance += updatedRoom.distance
  }

  return { newBoard: newBoard, cost: distance * getMoveCostsOfPiece(movingLetter) }
}

const stringArrayEqual = (arr1: string[], arr2: string[]): boolean => {
  if (arr1.length !== arr2.length) {
    return false
  }

  let equal: boolean = true
  for (let i = 0; i < arr1.length && equal; i++) {
    equal = arr1[i] === arr2[i]
  }

  return equal
}

const getStates = (startBoard: string[]) => {
  const states = {}
  const boardsToCheck: string[][] = [startBoard]
  states[startBoard.toString()] = 0

  while (boardsToCheck.length > 0) {
    const boardToCheck: string[] = boardsToCheck.splice(0, 1)[0]

    for (let i = 0; i < boardToCheck.length; i++) {
      if (getFirstPieceFromRoom(boardToCheck[i]) !== undefined) {
        const possibleDestinations: number[] = getAllPossibleMoves(boardToCheck, i)
        const boardInStates: number | undefined = states[boardToCheck.toString()]

        for (let possible of possibleDestinations) {
          const { newBoard, cost } = movePiece(boardToCheck, i, possible)
          const newCosts = (boardInStates ? boardInStates : 0) + cost
          const newBoardInStates = states[newBoard.toString()]

          if (newBoardInStates === undefined || newCosts < newBoardInStates) {
            states[newBoard.toString()] = newCosts
            boardsToCheck.push(newBoard)
          }
        }
      }
    }
  }

  return states
}

const goA = (input) => {
  const lines: string[] = splitToLines(input)

  const board: string[] = []

  for (let i = 0; i < Array.from(lines[1].replace(/#/g, "")).length; i++) {
    board.push(".")
  }

  const upperRoomLine: string = lines[2]
  const characterUpperRoom: string[] = Array.from(upperRoomLine.replace(/#/g, ""))

  const lowerRoomLine: string = lines[3]
  const characterLowerRoom: string[] = Array.from(lowerRoomLine.replace(/#/g, "").replace(/ /g, ""))

  for (let i = 0; i < 4; i++) {
    board[2 + (i * 2)] = characterUpperRoom[i] + characterLowerRoom[i]
  }

  const states = getStates(board)

  return states[".,.,AA,.,BB,.,CC,.,DD,.,."]
}

const goB = (input) => {
  const lines: string[] = splitToLines(input)

  const board: string[] = []

  for (let i = 0; i < Array.from(lines[1].replace(/#/g, "")).length; i++) {
    board.push(".")
  }

  const first: string = lines[2]
  const firstArr: string[] = Array.from(first.replace(/#/g, ""))

  const second: string = lines[3]
  const secondArr: string[] = Array.from(second.replace(/#/g, "").replace(/ /g, ""))

  const third: string = lines[4]
  const thirdArr: string[] = Array.from(third.replace(/#/g, "").replace(/ /g, ""))

  const fourth: string = lines[5]
  const fourthArr: string[] = Array.from(fourth.replace(/#/g, "").replace(/ /g, ""))

  for (let i = 0; i < 4; i++) {
    board[2 + (i * 2)] = firstArr[i] + secondArr[i] + thirdArr[i] + fourthArr[i]
  }

  const states = getStates(board)

  return states[".,.,AAAA,.,BBBB,.,CCCC,.,DDDD,.,."]
}

/* Tests */

test(goA(prepareInput(readInputFromSpecialFile("testInput.txt"))), 12521)

/* Results */

console.time("Time")
const resultA = goA(input)
const resultB = goB(prepareInput(readInputFromSpecialFile("inputTask2.txt")))
console.timeEnd("Time")

console.log("Solution to part 1:", resultA)
console.log("Solution to part 2:", resultB)
