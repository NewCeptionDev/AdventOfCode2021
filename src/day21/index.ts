import { readInput, test } from "../utils"
import { readInputFromSpecialFile, splitToLines } from "../utils/readInput"

const prepareInput = (rawInput: string) => rawInput

const input = prepareInput(readInput())

interface Player {
  position: number;
  score: number;
}

const movePlayer = (player: Player, dice: number): { timesMoved: number, won: boolean, newDice: number } => {
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
  }
}

const goA = (input) => {
  const lines = splitToLines(input)
  const players: Player[] = []

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

const updateDimensions = (dimensions: Map<Player[], number>): Map<Player[], number> => {
  const newDimensions: Map<Player[], number> = new Map<Player[], number>()
  for (let key of Array.from(dimensions.keys())) {
    if (key[0].score < 21 && key[1].score < 21) {
      for (let steps = 3; steps <= 9; steps++) {
        let newPlayer1Position = (key[0].position + steps) % 10
        newPlayer1Position = newPlayer1Position === 0 ? 10 : newPlayer1Position

        const player1Wins = key[0].score + newPlayer1Position >= 21

        if (!player1Wins) {
          for (let steps2 = 3; steps2 <= 9; steps2++) {
            let newPlayer2Position = (key[1].position + steps2) % 10
            let dimensionInMap = Array.from(newDimensions.keys()).find(dimension => dimension[0]?.position === newPlayer1Position && dimension[0]?.score === key[0].score + newPlayer1Position && dimension[1]?.position === newPlayer2Position && dimension[1]?.score === key[1].score + newPlayer2Position)

            if (!dimensionInMap) {
              dimensionInMap = [{
                position: newPlayer1Position,
                score: key[0].score + newPlayer1Position,
              },
                {
                  position: newPlayer2Position,
                  score: key[1].score + (key[1].position !== newPlayer2Position ? newPlayer2Position : 0),
                }]
              newDimensions.set(dimensionInMap, 0)
            }

            newDimensions.set(dimensionInMap, newDimensions.get(dimensionInMap) + dimensions.get(key) * getAmountOfDimensionsWithStepCount(steps))
          }
        } else {

          let dimensionInMap = Array.from(newDimensions.keys()).find(dimension => dimension[0]?.position === newPlayer1Position && dimension[0]?.score === key[0].score + newPlayer1Position && dimension[1]?.position === key[1].position && dimension[1]?.score === key[1].score)

          if (!dimensionInMap) {
            dimensionInMap = [{
              position: newPlayer1Position,
              score: key[0].score + newPlayer1Position,
            },
              {
                position: key[1].position,
                score: key[1].score,
              }]
            newDimensions.set(dimensionInMap, 0)
          }

          newDimensions.set(dimensionInMap, newDimensions.get(dimensionInMap) + dimensions.get(key) * getAmountOfDimensionsWithStepCount(steps))
        }
      }
    } else {
      if (!newDimensions.has(key)) {
        newDimensions.set(key, dimensions.get(key))
      } else {
        newDimensions.set(key, newDimensions.get(key) + dimensions.get(key))
      }
    }
  }

  return newDimensions
}

const goB = (input) => {
  const lines = splitToLines(input)
  const players: Player[] = []

  for (let line of lines) {
    players.push({
      position: parseInt(line.split(": ")[1]),
      score: 0,
    })
  }

  let dimensions: Map<Player[], number> = new Map<Player[], number>()

  dimensions.set(players, 1)

  while (Array.from(dimensions.keys()).find(dimension => dimension[0].score < 21 && dimension[1].score < 21)) {
    dimensions = updateDimensions(dimensions)
  }

  console.log(dimensions)

  const player1DimensionsWon: number = Array.from(dimensions.keys()).filter(dimension => dimension[0].score >= 21).map(key => dimensions.get(key)).reduce((previousValue, currentValue) => previousValue + currentValue, 0)
  const player2DimensionsWon: number = Array.from(dimensions.keys()).filter(dimension => dimension[1].score >= 21).map(key => dimensions.get(key)).reduce((previousValue, currentValue) => previousValue + currentValue, 0)

  return player1DimensionsWon > player2DimensionsWon ? player1DimensionsWon : player2DimensionsWon
}

/* Tests */

test(goA(prepareInput(readInputFromSpecialFile("testInput.txt"))), 739785)
test(goB(prepareInput(readInputFromSpecialFile("testInput.txt"))), 444356092776315)

/* Results */

console.time("Time")
//const resultA = goA(input)
//const resultB = goB(input)
console.timeEnd("Time")

//console.log("Solution to part 1:", resultA)
//console.log("Solution to part 2:", resultB)
