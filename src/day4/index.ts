import { test, readInput } from "../utils"
import { readInputFromSpecialFile } from "../utils/readInput"

const prepareInput = (rawInput: string) => rawInput

const input = prepareInput(readInput())

const getBoard = (lines: string[]): number[] => {
  let board: number[] = [];

  for(let line of lines){
    line.split(" ").filter(value => value !== "").forEach(value => board.push(parseInt(value)));
  }

  return board;
}

const getBoards = (lines: string[]) => {
  let boards: number[][] = [];
  let currentBoard: string[] = [];

  for(let line of lines.slice(2, lines.length)){
    if(line.trimStart() === ""){
      boards.push(getBoard(currentBoard));
      currentBoard = [];
    } else {
      currentBoard.push(line);
    }
  }

  return boards;
}

const getHorizontalWinConstellations = (board: number[]): number[][] => {
  return [
    board.slice(0,5),
    board.slice(5,10),
    board.slice(10,15),
    board.slice(15,20),
    board.slice(20,25)
  ]
}

const getVerticalWinConstellations = (board: number[]): number[][] => {
  return [
    [board[0], board[5], board[10], board[15], board[20]],
    [board[1], board[6], board[11], board[16], board[21]],
    [board[2], board[7], board[12], board[17], board[22]],
    [board[3], board[8], board[13], board[18], board[23]],
    [board[4], board[9], board[14], board[19], board[24]],
  ]
}

const checkIfBoardWon = (board: number[], drawnTillNow: number[]): boolean => {
  let winConstellations: number[][] = getHorizontalWinConstellations(board);
  winConstellations = winConstellations.concat(getVerticalWinConstellations(board));

  let winningBoard: boolean = false;

  for(let i = 0; i < winConstellations.length && !winningBoard; i++){
    let allIncluded: boolean = true;
    for(let j = 0; j < winConstellations[i].length && allIncluded; j++){
      allIncluded = allIncluded && drawnTillNow.includes(winConstellations[i][j]);
    }

    winningBoard = allIncluded;
  }

  return winningBoard;
}

const goA = (input) => {
  const lines = input.split("\n");

  const drawOrder: number[] = lines[0].split(",").map(number => parseInt(number.trimStart()));

  const boards: number[][] = getBoards(lines)

  let winningBoard: number[] = [];
  let numbersDrawn: number = 0;

  while (winningBoard.length === 0 && numbersDrawn + 1 < drawOrder.length){
    numbersDrawn++;

    for(let board of boards){
      if(checkIfBoardWon(board, drawOrder.slice(0, numbersDrawn))){
        winningBoard = board;
      }
    }
  }

  let sumOfAllUnmarkedNumbers: number = winningBoard.filter(value => !drawOrder.slice(0,numbersDrawn).includes(value)).reduce((previousValue, currentValue) => previousValue + currentValue);

  return sumOfAllUnmarkedNumbers * drawOrder[numbersDrawn - 1];
}

const goB = (input) => {
  const lines = input.split("\n");

  const drawOrder: number[] = lines[0].split(",").map(number => parseInt(number.trimStart()));

  const boards: number[][] = getBoards(lines)

  let numbersDrawn: number = 0;
  let lastBoardWon: boolean = false;

  while (!lastBoardWon && numbersDrawn + 1 < drawOrder.length){
    numbersDrawn++;

    for(let i = 0; i < boards.length; i++){
      if(checkIfBoardWon(boards[i], drawOrder.slice(0, numbersDrawn))){
        if(boards.length === 1){
          lastBoardWon = true;
        } else {
          boards.splice(i, 1);
        }
      }
    }
  }

  let sumOfAllUnmarkedNumbers: number = boards[0].filter(value => !drawOrder.slice(0,numbersDrawn).includes(value)).reduce((previousValue, currentValue) => previousValue + currentValue);

  return sumOfAllUnmarkedNumbers * drawOrder[numbersDrawn - 1];
}

/* Tests */

test(4512, goA(prepareInput(readInputFromSpecialFile("testInput.txt"))));

test(1924, goB(prepareInput(readInputFromSpecialFile("testInput.txt"))));

/* Results */

console.time("Time")
const resultA = goA(input)
const resultB = goB(input)
console.timeEnd("Time")

console.log("Solution to part 1:", resultA)
console.log("Solution to part 2:", resultB)
