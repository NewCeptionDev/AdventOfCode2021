import { readInput, test } from "../utils"
import { readInputFromSpecialFile, splitToLines } from "../utils/readInput"

const prepareInput = (rawInput: string) => rawInput

const input = prepareInput(readInput())

interface Position {
  x: number;
  y: number;
  z: number;
}

interface Scanner {
  id: number;
  scannedProbes: Position[];
  overlaps: ScannerWithRelativePosition[]
}

interface PositionPair {
  left: Position;
  right: Position;
}

interface DistancePair {
  left: Position,
  right: Position
}

interface ScannerWithRelativePosition {
  scanner: Scanner;
  scannerPositionRelative: Position,
  orientation: PositionTransform
}

enum PositionElement {
  X,
  Y,
  Z,
  NEGATIVE_X,
  NEGATIVE_Y,
  NEGATIVE_Z
}

interface PositionTransform {
  xReflects: PositionElement;
  yReflects: PositionElement;
  zReflects: PositionElement;
}

const parseScanner = (lines: string[]): Scanner[] => {
  const allScanner: Scanner[] = []

  let currentScannerId: number = undefined
  let currentScannerProbes: Position[] = []

  for (let line of lines) {
    if (line.startsWith("---")) {
      if (currentScannerId !== undefined) {
        allScanner.push({ id: currentScannerId, scannedProbes: currentScannerProbes, overlaps: [] })
        currentScannerProbes = []
      }
      currentScannerId = parseInt(line.split(" ")[2])
    } else {
      const positionParts: number[] = line.split(",").map(value => parseInt(value))
      currentScannerProbes.push({ x: positionParts[0], y: positionParts[1], z: positionParts[2] })
    }
  }
  allScanner.push({ id: currentScannerId, scannedProbes: currentScannerProbes, overlaps: [] })

  return allScanner
}

const calculateRelativeProbeDistances = (probes: Position[]): Map<Position, Position[]> => {
  const relativeDistancesToProbe: Map<Position, Position[]> = new Map<Position, Position[]>()

  for (let probe of probes) {
    relativeDistancesToProbe.set(probe, [])
    for (let secondProbe of probes) {
      if (probe !== secondProbe) {
        relativeDistancesToProbe.get(probe).push({
          x: probe.x - secondProbe.x,
          y: probe.y - secondProbe.y,
          z: probe.z - secondProbe.z,
        })
      }
    }
  }

  return relativeDistancesToProbe
}

const getAllPossibleScannerOrientations = (): PositionTransform[] => {
  return [{ xReflects: PositionElement.X, yReflects: PositionElement.Y, zReflects: PositionElement.Z },
    { xReflects: PositionElement.X, yReflects: PositionElement.Z, zReflects: PositionElement.NEGATIVE_Y },
    { xReflects: PositionElement.X, yReflects: PositionElement.NEGATIVE_Y, zReflects: PositionElement.NEGATIVE_Z },
    { xReflects: PositionElement.X, yReflects: PositionElement.NEGATIVE_Z, zReflects: PositionElement.Y },
    { xReflects: PositionElement.NEGATIVE_X, yReflects: PositionElement.Y, zReflects: PositionElement.NEGATIVE_Z },
    { xReflects: PositionElement.NEGATIVE_X, yReflects: PositionElement.Z, zReflects: PositionElement.Y },
    {
      xReflects: PositionElement.NEGATIVE_X,
      yReflects: PositionElement.NEGATIVE_Y,
      zReflects: PositionElement.Z,
    },
    {
      xReflects: PositionElement.NEGATIVE_X,
      yReflects: PositionElement.NEGATIVE_Z,
      zReflects: PositionElement.NEGATIVE_Y,
    },
    { xReflects: PositionElement.Y, yReflects: PositionElement.NEGATIVE_X, zReflects: PositionElement.Z },
    { xReflects: PositionElement.Y, yReflects: PositionElement.Z, zReflects: PositionElement.X },
    { xReflects: PositionElement.Y, yReflects: PositionElement.NEGATIVE_Z, zReflects: PositionElement.NEGATIVE_X },
    { xReflects: PositionElement.Y, yReflects: PositionElement.X, zReflects: PositionElement.NEGATIVE_Z },
    { xReflects: PositionElement.NEGATIVE_Y, yReflects: PositionElement.NEGATIVE_Z, zReflects: PositionElement.X },
    { xReflects: PositionElement.NEGATIVE_Y, yReflects: PositionElement.Z, zReflects: PositionElement.NEGATIVE_X },
    {
      xReflects: PositionElement.NEGATIVE_Y,
      yReflects: PositionElement.NEGATIVE_X,
      zReflects: PositionElement.NEGATIVE_Z,
    },
    { xReflects: PositionElement.NEGATIVE_Y, yReflects: PositionElement.X, zReflects: PositionElement.Z },
    { xReflects: PositionElement.Z, yReflects: PositionElement.Y, zReflects: PositionElement.NEGATIVE_X },
    { xReflects: PositionElement.Z, yReflects: PositionElement.NEGATIVE_Y, zReflects: PositionElement.X },
    { xReflects: PositionElement.Z, yReflects: PositionElement.NEGATIVE_X, zReflects: PositionElement.NEGATIVE_Y },
    { xReflects: PositionElement.Z, yReflects: PositionElement.X, zReflects: PositionElement.Y },
    { xReflects: PositionElement.NEGATIVE_Z, yReflects: PositionElement.X, zReflects: PositionElement.NEGATIVE_Y },
    { xReflects: PositionElement.NEGATIVE_Z, yReflects: PositionElement.NEGATIVE_X, zReflects: PositionElement.Y },
    {
      xReflects: PositionElement.NEGATIVE_Z,
      yReflects: PositionElement.NEGATIVE_Y,
      zReflects: PositionElement.NEGATIVE_X,
    },
    { xReflects: PositionElement.NEGATIVE_Z, yReflects: PositionElement.X, zReflects: PositionElement.Y }]
}

const getTranslatedPosition = (position: Position, positionElement: PositionElement): number => {
  switch (positionElement) {
    case PositionElement.X:
      return position.x
    case PositionElement.NEGATIVE_X:
      return -1 * position.x
    case PositionElement.Y:
      return position.y
    case PositionElement.NEGATIVE_Y:
      return -1 * position.y
    case PositionElement.Z:
      return position.z
    case PositionElement.NEGATIVE_Z:
      return -1 * position.z
  }
}

const checkIfPositionsCouldBeEqual = (position1: Position, position2: Position): boolean => {
  return getAllPossibleScannerOrientations().map(orientation => {
    let foundCoordinateMatches: number = 0

    if (position1.x === getTranslatedPosition(position2, orientation.xReflects)) {
      foundCoordinateMatches++
    }
    if (position1.y === getTranslatedPosition(position2, orientation.yReflects)) {
      foundCoordinateMatches++
    }
    if (position1.z === getTranslatedPosition(position2, orientation.zReflects)) {
      foundCoordinateMatches++
    }

    return foundCoordinateMatches === 3
  }).reduce((previousValue, currentValue) => previousValue || currentValue)
}

const goA = (input) => {
  const lines: string[] = splitToLines(input)
  const scanners: Scanner[] = parseScanner(lines)

  const relativeProbeDistancesPerScanner: Map<Scanner, Map<Position, Position[]>> = new Map<Scanner, Map<Position, Position[]>>()
  for (let scanner of scanners) {
    relativeProbeDistancesPerScanner.set(scanner, calculateRelativeProbeDistances(scanner.scannedProbes))
  }

  const scannerZero: Scanner = scanners.find(scanner => scanner.id === 0)
  let integratedScanner: Scanner[] = []

  let failed = 0

  while (integratedScanner.length < scanners.length - 1) {
    let integratedScannerBefore = integratedScanner.length
    let newlyIntegrated: Position[] = []
    for (let secondScanner of scanners) {
      if (scannerZero !== secondScanner && !integratedScanner.includes(secondScanner)) {
        let possibleSameProbes: Map<PositionPair, DistancePair> = new Map<PositionPair, DistancePair>()

        const relativeDistancesSecondScanner = Array.from(relativeProbeDistancesPerScanner.get(secondScanner).keys())
        const relativeDistancesScannerZero = Array.from(relativeProbeDistancesPerScanner.get(scannerZero).keys())

        for (let x = 0; x < relativeDistancesSecondScanner.length; x++) {
          for (let y = 0; y < relativeDistancesScannerZero.length; y++) {
            let foundMatch: boolean = false
            for (let i = 0; i < relativeProbeDistancesPerScanner.get(secondScanner).get(relativeDistancesSecondScanner[x]).length && !foundMatch; i++) {
              let position = relativeProbeDistancesPerScanner.get(scannerZero).get(relativeDistancesScannerZero[y]).find(position => checkIfPositionsCouldBeEqual(position, relativeProbeDistancesPerScanner.get(secondScanner).get(relativeDistancesSecondScanner[x])[i]))

              if (position !== undefined) {
                foundMatch = true
                // if (!Array.from(possibleSameProbes.keys()).find(probe => (probe.left.x === relativeDistancesScannerZero[y].x && probe.left.y === relativeDistancesScannerZero[y].y && probe.left.z === relativeDistancesScannerZero[y].z) || (probe.right.x === relativeDistancesSecondScanner[x].x && probe.right.y === relativeDistancesSecondScanner[x].y && probe.right.z === relativeDistancesSecondScanner[x].z)))
                possibleSameProbes.set({
                  left: relativeDistancesScannerZero[y],
                  right: relativeDistancesSecondScanner[x],
                }, {
                  left: position,
                  right: relativeProbeDistancesPerScanner.get(secondScanner).get(relativeDistancesSecondScanner[x])[i],
                })
              }
            }
          }
        }

        if (Array.from(possibleSameProbes.keys()).length >= 12) {
          let usedOrientations: Map<PositionTransform, number> = new Map<PositionTransform, number>()

          for (let distance of Array.from(possibleSameProbes.values())) {
            const usedOrientation = getAllPossibleScannerOrientations().find(orientation =>
              distance.left.x === getTranslatedPosition(distance.right, orientation.xReflects) && distance.left.y === getTranslatedPosition(distance.right, orientation.yReflects) && distance.left.z === getTranslatedPosition(distance.right, orientation.zReflects))

            let orientation = Array.from(usedOrientations.keys()).find(elem => elem.xReflects === usedOrientation.xReflects && elem.yReflects === usedOrientation.yReflects && elem.zReflects === usedOrientation.zReflects)

            if (orientation) {
              usedOrientations.set(orientation, usedOrientations.get(orientation) + 1)
            } else if (usedOrientation) {
              usedOrientations.set(usedOrientation, 1)
            }

          }

          let keyWithMaxValue = undefined
          let maxValue: number = Number.MIN_SAFE_INTEGER
          let sameMaxValue: boolean = false

          for (let key of Array.from(usedOrientations.keys())) {
            if (!keyWithMaxValue || usedOrientations.get(key) > maxValue) {
              keyWithMaxValue = key
              maxValue = usedOrientations.get(key)
              sameMaxValue = false
            } else if (usedOrientations.get(key) === maxValue) {
              sameMaxValue = true
            }
          }

          if (!sameMaxValue) {

            const basePositions: Position[] = Array.from(possibleSameProbes.keys()).map(pair => {
              return {
                x: pair.left.x - getTranslatedPosition(pair.right, keyWithMaxValue.xReflects),
                y: pair.left.y - getTranslatedPosition(pair.right, keyWithMaxValue.yReflects),
                z: pair.left.z - getTranslatedPosition(pair.right, keyWithMaxValue.zReflects),
              }
            })

            const mostBasePosition: Map<Position, number> = new Map<Position, number>()

            for (let position of basePositions) {
              let foundPosition = Array.from(mostBasePosition.keys()).find(base => base.x === position.x && base.y === position.y && base.z === position.z)

              if (foundPosition) {
                mostBasePosition.set(foundPosition, mostBasePosition.get(foundPosition) + 1)
              } else {
                mostBasePosition.set(position, 1)
              }
            }

            let mostFoundBasePosition = undefined
            maxValue = Number.MIN_SAFE_INTEGER

            for (let position of Array.from(mostBasePosition.keys())) {
              if (!mostFoundBasePosition || mostBasePosition.get(position) > maxValue) {
                mostFoundBasePosition = position
                maxValue = mostBasePosition.get(position)
              }
            }

            const secondScannerPosition = mostFoundBasePosition

            let transformedPositions: Position[] = secondScanner.scannedProbes

            if (secondScanner.id === 12) {
              console.log("Transformation for Scanner 27")
              console.log("Orientation", keyWithMaxValue)
              console.log("Relative Position:", secondScannerPosition)
            }

            transformedPositions = transformedPositions.map(position => {
              if (secondScanner.id === 12) {

                console.log("Position: ", position)
                console.log("New Position: ", {
                  x: secondScannerPosition.x + getTranslatedPosition(position, keyWithMaxValue.xReflects),
                  y: secondScannerPosition.y + getTranslatedPosition(position, keyWithMaxValue.yReflects),
                  z: secondScannerPosition.z + getTranslatedPosition(position, keyWithMaxValue.zReflects),
                })
              }

              return {
                x: secondScannerPosition.x + getTranslatedPosition(position, keyWithMaxValue.xReflects),
                y: secondScannerPosition.y + getTranslatedPosition(position, keyWithMaxValue.yReflects),
                z: secondScannerPosition.z + getTranslatedPosition(position, keyWithMaxValue.zReflects),
              }
            })

            let i = 0
            for (let probePosition of transformedPositions) {
              if (!scannerZero.scannedProbes.find(position => position.x === probePosition.x && position.y === probePosition.y && position.z === probePosition.z)) {
                i++
                scannerZero.scannedProbes.push(probePosition)
              }
              if (!newlyIntegrated.find(position => position.x === probePosition.x && position.y === probePosition.y && position.z === probePosition.z)) {
                newlyIntegrated.push(probePosition)
              }
            }

            integratedScanner.push(secondScanner)
            console.log("Integrated Scanner: ", secondScanner.id)
            if (i > secondScanner.scannedProbes.length - 12) {
              console.error("Unnatural Amount of Positions added for", secondScanner.id, i, secondScanner.scannedProbes.length, secondScannerPosition, secondScanner.scannedProbes, transformedPositions, Array.from(possibleSameProbes.keys()), usedOrientations, mostBasePosition)
            }

            console.log("Already Integrated: ", integratedScanner.map(scanner => scanner.id))

            if (failed !== 0) {
              failed = 0
            }
          }
        }
      }
    }

    console.log("Finished one run")

    relativeProbeDistancesPerScanner.set(scannerZero, calculateRelativeProbeDistances(newlyIntegrated))

    if (integratedScanner.length === integratedScannerBefore) {
      if (failed === 0) {
        failed = 1
        relativeProbeDistancesPerScanner.set(scannerZero, calculateRelativeProbeDistances(scannerZero.scannedProbes))
      } else {
        console.error("Couldnt find another Overlap!")
        break
      }
    }
  }

  return scannerZero.scannedProbes.length
}

const goB = (input) => {
  return
}

/* Tests */

test(goA(prepareInput(readInputFromSpecialFile("testInput.txt"))), 79)

/* Results */

console.time("Time")
const resultA = goA(input)
const resultB = goB(input)
console.timeEnd("Time")

console.log("Solution to part 1:", resultA)
console.log("Solution to part 2:", resultB)
