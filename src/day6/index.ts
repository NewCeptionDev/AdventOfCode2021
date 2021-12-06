import { test, readInput } from "../utils"

const prepareInput = (rawInput: string) => rawInput

const input = prepareInput(readInput())

const fishCreatedWithDaysRemaining = (days: number, alreadyCalculatedCreations: number[]) => {
  if(days < 7) {
    return 1;
  } else if(days >= 7 && days <= 8){
    return 2;
  } else {
    return 1 + alreadyCalculatedCreations[days - 7] + alreadyCalculatedCreations[days - 9];
  }
}

const goA = (input) => {
  let lanternFish: number[] = input.split(",").filter(line => line !== "").map(value => parseInt(value));

  let alreadyCalculatedCreations: number[] = [];

  for(let i = 0; i <= 80; i++){
    alreadyCalculatedCreations[i] = fishCreatedWithDaysRemaining(i, alreadyCalculatedCreations);
  }

  return lanternFish.map(value => alreadyCalculatedCreations[80 - value - 1] + 1).reduce((previousValue, currentValue) => previousValue + currentValue, 0);
}

const goB = (input) => {
  let lanternFish: number[] = input.split(",").filter(line => line !== "").map(value => parseInt(value));

  let alreadyCalculatedCreations: number[] = [];

  for(let i = 0; i <= 256; i++){
    alreadyCalculatedCreations[i] = fishCreatedWithDaysRemaining(i, alreadyCalculatedCreations);
  }

  return lanternFish.map(value => alreadyCalculatedCreations[256 - value - 1] + 1).reduce((previousValue, currentValue) => previousValue + currentValue, 0);
}

/* Tests */

test(goA("3,4,3,1,2"), 5934)

/* Results */

console.time("Time")
const resultA = goA(input)
const resultB = goB(input)
console.timeEnd("Time")

console.log("Solution to part 1:", resultA)
console.log("Solution to part 2:", resultB)
