import { readInput, test } from "../utils"

const prepareInput = (rawInput: string) => rawInput

const input = prepareInput(readInput())

interface Packet {
  version: number;
  typeId: number;
  literal?: number;
  subPackets?: Packet[];
}

const parseHexaDecimalToBinary = (line: string): number[] => {
  const binary: number[] = []

  for (let char of Array.from(line)) {
    switch (char) {
      case "0":
        binary.push(...[0, 0, 0, 0])
        break
      case "1":
        binary.push(...[0, 0, 0, 1])
        break
      case "2":
        binary.push(...[0, 0, 1, 0])
        break
      case "3":
        binary.push(...[0, 0, 1, 1])
        break
      case "4":
        binary.push(...[0, 1, 0, 0])
        break
      case "5":
        binary.push(...[0, 1, 0, 1])
        break
      case "6":
        binary.push(...[0, 1, 1, 0])
        break
      case "7":
        binary.push(...[0, 1, 1, 1])
        break
      case "8":
        binary.push(...[1, 0, 0, 0])
        break
      case "9":
        binary.push(...[1, 0, 0, 1])
        break
      case "A":
        binary.push(...[1, 0, 1, 0])
        break
      case "B":
        binary.push(...[1, 0, 1, 1])
        break
      case "C":
        binary.push(...[1, 1, 0, 0])
        break
      case "D":
        binary.push(...[1, 1, 0, 1])
        break
      case "E":
        binary.push(...[1, 1, 1, 0])
        break
      case "F":
        binary.push(...[1, 1, 1, 1])
        break
    }
  }

  return binary
}

const binaryToDecimal = (binary: number[]): number => {
  let result: number = 0

  for (let i = binary.length - 1; i >= 0; i--) {
    if (binary[i] === 1) {
      result += Math.pow(2, (binary.length - 1 - i))
    }
  }

  return result
}

const parsePacket = (binary: number[], startIndex: number): { packet: Packet, lastIndex: number } => {
  let currentIndex: number = startIndex

  const version = binaryToDecimal(binary.slice(currentIndex, currentIndex + 3))
  const type = binaryToDecimal(binary.slice(currentIndex + 3, currentIndex + 6))

  currentIndex = currentIndex + 6

  if (type === 4) {
    let literal: number[] = []
    while (binary[currentIndex] === 1) {
      literal.push(...binary.slice(currentIndex + 1, currentIndex + 5))
      currentIndex = currentIndex + 5
    }
    literal.push(...binary.slice(currentIndex + 1, currentIndex + 5))

    return {
      packet: {
        version: version,
        typeId: type,
        literal: binaryToDecimal(literal),
      },
      lastIndex: currentIndex + 4,
    }
  } else {
    let subPackets: Packet[] = []
    const lengthTypeId: number = binary[currentIndex]
    currentIndex++

    if (lengthTypeId === 0) {
      const totalLengthOfSubPackets: number = binaryToDecimal(binary.slice(currentIndex, currentIndex + 15))
      currentIndex += 15

      const endIndex = currentIndex + totalLengthOfSubPackets

      while (endIndex > currentIndex) {
        const { packet, lastIndex } = parsePacket(binary, currentIndex)
        subPackets.push(packet)
        currentIndex = lastIndex + 1
      }
    } else if (lengthTypeId === 1) {
      const numberOfSubPackets: number = binaryToDecimal(binary.slice(currentIndex, currentIndex + 11))
      currentIndex += 11

      while (subPackets.length < numberOfSubPackets) {
        const { packet, lastIndex } = parsePacket(binary, currentIndex)
        subPackets.push(packet)
        currentIndex = lastIndex + 1
      }
    }

    return {
      packet: {
        version: version,
        typeId: type,
        subPackets: subPackets,
      },
      lastIndex: currentIndex - 1,
    }
  }
}

const sumOfVersion = (packet: Packet): number => {
  let sumOfSubPackets: number = 0

  if (packet.subPackets) {
    sumOfSubPackets = packet.subPackets.map(packet => sumOfVersion(packet)).reduce((previousValue, currentValue) => previousValue + currentValue, 0)
  }

  return packet.version + sumOfSubPackets
}

const resolvePacketLiteral = (packet: Packet): number => {
  if (packet.literal) {
    return packet.literal
  } else if (packet.subPackets) {
    const subLiterals: number[] = packet.subPackets.map(packet => resolvePacketLiteral(packet))
    switch (packet.typeId) {
      case 0:
        return subLiterals.reduce((previousValue, currentValue) => previousValue + currentValue, 0)
      case 1:
        return subLiterals.reduce((previousValue, currentValue) => previousValue * currentValue, 1)
      case 2:
        let minimum: number = Number.MAX_SAFE_INTEGER

        for (let value of subLiterals) {
          if (value < minimum) {
            minimum = value
          }
        }

        return minimum
      case 3:
        let maximum: number = Number.MIN_SAFE_INTEGER

        for (let value of subLiterals) {
          if (value > maximum) {
            maximum = value
          }
        }

        return maximum
      case 5:
        return subLiterals[0] > subLiterals[1] ? 1 : 0
      case 6:
        return subLiterals[0] < subLiterals[1] ? 1 : 0
      case 7:
        return subLiterals[0] === subLiterals[1] ? 1 : 0
    }
  }
}

const goA = (input) => {
  const binary = parseHexaDecimalToBinary(input)

  const packet: Packet = parsePacket(binary, 0).packet

  return sumOfVersion(packet)
}

const goB = (input) => {
  const binary = parseHexaDecimalToBinary(input)

  const packet: Packet = parsePacket(binary, 0).packet

  return resolvePacketLiteral(packet)
}

/* Tests */

test(binaryToDecimal([1, 1, 1, 1]), 15)
test(binaryToDecimal([0, 1, 0, 1]), 5)
test(goA("8A004A801A8002F478"), 16)

/* Results */

console.time("Time")
const resultA = goA(input)
const resultB = goB(input)
console.timeEnd("Time")

console.log("Solution to part 1:", resultA)
console.log("Solution to part 2:", resultB)
