import { readInput, test } from "../utils"
import { readInputFromSpecialFile, splitToLines } from "../utils/readInput"

const prepareInput = (rawInput: string) => rawInput

const input = prepareInput(readInput())

interface PositionAndScore {
  position: number;
  score: number;
}

interface PositionAndScorePair {
  left: PositionAndScore;
  right: PositionAndScore;
}

interface GameState {
  player1Score: number;
  player2Score: number;
  player1Position: number;
  player2Position: number;
  playersTurn: number;
}

const movePlayer = (player: PositionAndScore, dice: number): { timesMoved: number, won: boolean, newDice: number } => {
  let fullPositionMove: number = dice * 3 + 3

  if (dice >= 99) {
    let clonedDice: number = dice
    fullPositionMove = 0
    for (let i = 0; i < 3; i++) {
      fullPositionMove += clonedDice
      clonedDice = clonedDice === 100 ? 1 : clonedDice + 1
    }
  }

  let movesTillWon: number = 0
  if (player.score + fullPositionMove <= 1000) {
    player.position = (player.position + fullPositionMove) % 10
    player.position = player.position === 0 ? 10 : player.position
    player.score += player.position
    movesTillWon = 3
    dice = dice + 3 > 100 ? dice + 3 - 100 : dice + 3
  } else {
    for (let i = 0; i < 3 && player.score < 1000; i++) {
      player.position = (player.position + dice) % 10
      player.position = player.position === 0 ? 10 : player.position
      dice = dice === 100 ? 1 : dice + 1
      movesTillWon += 1
    }
    player.score += player.position
  }
  return { timesMoved: movesTillWon, won: player.score >= 1000, newDice: dice }
}

const getAmountOfDimensionsWithStepCount = (stepCount: number): number => {
  switch (stepCount) {
    case 3:
      return 1
    case 4:
      return 3
    case 5:
      return 6
    case 6:
      return 7
    case 7:
      return 6
    case 8:
      return 3
    case 9:
      return 1
    default:
      console.error("Amount with undefined Step Count", stepCount)
      return 1;
  }
}

const goA = (input) => {
  const lines = splitToLines(input)
  const players: PositionAndScore[] = []

  for (let line of lines) {
    players.push({
      position: parseInt(line.split(": ")[1]),
      score: 0,
    })
  }

  let playerWon: boolean = false
  let dice: number = 1
  let diceRolled: number = 0

  while (!playerWon) {
    for (let i = 0; i < players.length && !playerWon; i++) {
      const { timesMoved, won, newDice } = movePlayer(players[i], dice)
      diceRolled += timesMoved
      playerWon = won
      dice = newDice
    }
  }

  return diceRolled * players.find(player => player.score < 1000).score
}


const calculateStep = (state: GameState, cache: Map<GameState, number[]>) : number[] => {
  let cacheState: GameState = Array.from(cache.keys()).find(cacheState => cacheState.player1Score === state.player1Score && cacheState.player2Score === state.player2Score && cacheState.playersTurn === state.playersTurn && cacheState.player1Position === state.player1Position && cacheState.player2Position === state.player2Position)
  if(cacheState) {
    return cache.get(cacheState)
  }

  if(state.player1Score >= 21) {
    return [1, 0]
  }

  if(state.player2Score >= 21) {
    return [0, 1]
  }

  let sums = [0, 0];
  for(let step = 3; step <= 9; step++) {
    let newPlayerPosition = state.playersTurn === 1 ? (state.player1Position + step) % 10 : (state.player2Position + step) % 10;
    newPlayerPosition = newPlayerPosition === 0 ? 10 : newPlayerPosition;
    const result: number[] = calculateStep({
      playersTurn: state.playersTurn === 1 ? 2 : 1,
      player1Position: state.playersTurn === 1 ? newPlayerPosition : state.player1Position,
      player2Position: state.playersTurn === 2 ? newPlayerPosition : state.player2Position,
      player1Score: state.playersTurn === 1 ? state.player1Score + newPlayerPosition : state.player1Score,
      player2Score: state.playersTurn === 2 ? state.player2Score + newPlayerPosition : state.player2Score
    }, cache);
    sums[0] = sums[0] + result[0] * getAmountOfDimensionsWithStepCount(step)
    sums[1] = sums[1] + result[1] * getAmountOfDimensionsWithStepCount(step)
  }

  cache.set(state, sums);

  return sums;
}

const goB = (input) => {
  const lines = splitToLines(input)
  const players: PositionAndScore[] = []

  for (let line of lines) {
    players.push({
      position: parseInt(line.split(": ")[1]),
      score: 0,
    })
  }

  const cache: Map<GameState, number[]> = new Map<GameState, number[]>();
  const result: number[]= calculateStep({
    playersTurn: 1,
    player1Score: 0,
    player2Score: 0,
    player1Position: players[0].position,
    player2Position: players[1].position
  }, cache)

  return result[0] > result[1] ? result[0] : result[1]
}

/* Tests */

test(goA(prepareInput(readInputFromSpecialFile("testInput.txt"))), 739785)
test(goB(prepareInput(readInputFromSpecialFile("testInput.txt"))), 444356092776315)

/* Results */

console.time("Time")
const resultA = goA(input)
const resultB = goB(input)
console.timeEnd("Time")

console.log("Solution to part 1:", resultA)
console.log("Solution to part 2:", resultB)
