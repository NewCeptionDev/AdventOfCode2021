import { test, readInput } from "../utils"

const prepareInput = (rawInput: string) => rawInput

const input = prepareInput(readInput())

interface PositionDistribution {
  minimumPosition: number;
  maximumPosition: number;
  crabsAtPositions: Map<number, number>;
}

enum FuelStrategy {
  ONE_PER_POSITION,
  GROWING_PER_POSITION
}

const createPositionDistribution = (positions: number[]): PositionDistribution => {
  const crabsAtPosition: Map<number, number> = new Map<number, number>()
  let minimumPosition: number = Number.MAX_SAFE_INTEGER;
  let maximumPosition: number = Number.MIN_SAFE_INTEGER;

  positions.forEach(position => {
    crabsAtPosition.set(position, crabsAtPosition.has(position) ? crabsAtPosition.get(position) + 1 : 1)

    if(position < minimumPosition) {
      minimumPosition = position;
    }

    if(position > maximumPosition) {
      maximumPosition = position;
    }
  })

  return {minimumPosition: minimumPosition, maximumPosition: maximumPosition, crabsAtPositions: crabsAtPosition};
}

const calculateMinimumFuelCosts = (positionDistribution: PositionDistribution, fuelStrategy: FuelStrategy): number => {
  let minimumFuelCost = Number.MAX_SAFE_INTEGER;
  const allPositions: number[] = Array.from(positionDistribution.crabsAtPositions.keys());

  for(let endPosition = positionDistribution.minimumPosition; endPosition < positionDistribution.maximumPosition; endPosition++) {
    let currentFuelCost = 0;

    for(let i = 0; i < allPositions.length && currentFuelCost < minimumFuelCost; i++) {
      const amountOfCrabsAtPosition: number = positionDistribution.crabsAtPositions.get(allPositions[i])

      switch (fuelStrategy) {
        case FuelStrategy.ONE_PER_POSITION:
          currentFuelCost += Math.abs(allPositions[i] - endPosition) * amountOfCrabsAtPosition;
          break;
        case FuelStrategy.GROWING_PER_POSITION:
          const movementNeeded: number = Math.abs(allPositions[i] - endPosition);
          currentFuelCost += ((movementNeeded * (movementNeeded + 1)) / 2) * amountOfCrabsAtPosition;
          break;
      }
    }

    if(currentFuelCost < minimumFuelCost) {
      minimumFuelCost = currentFuelCost;
    }
  }

  return minimumFuelCost;
}

const goA = (input) => {
  const horizontalPositions: number[] = input.split(",").filter(value => value !== "").map(value => parseInt(value))
  const positionDistribution: PositionDistribution = createPositionDistribution(horizontalPositions);

  return calculateMinimumFuelCosts(positionDistribution, FuelStrategy.ONE_PER_POSITION)
}

const goB = (input) => {
  const horizontalPositions: number[] = input.split(",").filter(value => value !== "").map(value => parseInt(value))
  const positionDistribution: PositionDistribution = createPositionDistribution(horizontalPositions);

  return calculateMinimumFuelCosts(positionDistribution, FuelStrategy.GROWING_PER_POSITION)
}

/* Tests */

test(goB("16,1,2,0,4,2,7,1,2,14"), 168)

/* Results */

console.time("Time")
const resultA = goA(input)
const resultB = goB(input)
console.timeEnd("Time")

console.log("Solution to part 1:", resultA)
console.log("Solution to part 2:", resultB)
