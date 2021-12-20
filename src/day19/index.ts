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
  positionRelativeToScannerZero: Position;
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
        allScanner.push({
          id: currentScannerId,
          scannedProbes: currentScannerProbes,
          positionRelativeToScannerZero: undefined,
        })
        currentScannerProbes = []
      }
      currentScannerId = parseInt(line.split(" ")[2])
    } else {
      const positionParts: number[] = line.split(",").map(value => parseInt(value))
      currentScannerProbes.push({ x: positionParts[0], y: positionParts[1], z: positionParts[2] })
    }
  }
  allScanner.push({
    id: currentScannerId,
    scannedProbes: currentScannerProbes,
    positionRelativeToScannerZero: undefined,
  })

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
    { xReflects: PositionElement.Y, yReflects: PositionElement.X, zReflects: PositionElement.NEGATIVE_Z },
    { xReflects: PositionElement.Y, yReflects: PositionElement.NEGATIVE_Z, zReflects: PositionElement.NEGATIVE_X },
    { xReflects: PositionElement.Y, yReflects: PositionElement.NEGATIVE_X, zReflects: PositionElement.Z },
    { xReflects: PositionElement.Y, yReflects: PositionElement.Z, zReflects: PositionElement.X },
    { xReflects: PositionElement.NEGATIVE_Y, yReflects: PositionElement.X, zReflects: PositionElement.Z },
    { xReflects: PositionElement.NEGATIVE_Y, yReflects: PositionElement.Z, zReflects: PositionElement.NEGATIVE_X },
    {
      xReflects: PositionElement.NEGATIVE_Y,
      yReflects: PositionElement.NEGATIVE_X,
      zReflects: PositionElement.NEGATIVE_Z,
    },
    { xReflects: PositionElement.NEGATIVE_Y, yReflects: PositionElement.NEGATIVE_Z, zReflects: PositionElement.X },
    { xReflects: PositionElement.Z, yReflects: PositionElement.Y, zReflects: PositionElement.NEGATIVE_X },
    { xReflects: PositionElement.Z, yReflects: PositionElement.NEGATIVE_X, zReflects: PositionElement.NEGATIVE_Y },
    { xReflects: PositionElement.Z, yReflects: PositionElement.NEGATIVE_Y, zReflects: PositionElement.X },
    { xReflects: PositionElement.Z, yReflects: PositionElement.X, zReflects: PositionElement.Y },
    { xReflects: PositionElement.NEGATIVE_Z, yReflects: PositionElement.X, zReflects: PositionElement.NEGATIVE_Y },
    { xReflects: PositionElement.NEGATIVE_Z, yReflects: PositionElement.NEGATIVE_X, zReflects: PositionElement.Y },
    {
      xReflects: PositionElement.NEGATIVE_Z,
      yReflects: PositionElement.NEGATIVE_Y,
      zReflects: PositionElement.NEGATIVE_X,
    },
    { xReflects: PositionElement.NEGATIVE_Z, yReflects: PositionElement.Y, zReflects: PositionElement.X }]
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

const updateScanner = (scanners: Scanner[]): Scanner[] => {
  const scannerZero: Scanner = scanners.find(scanner => scanner.id === 0)
  scannerZero.positionRelativeToScannerZero = { x: 0, y: 0, z: 0 }
  let integratedScanner: Scanner[] = []

  const allPossibleOrientations: PositionTransform[] = getAllPossibleScannerOrientations()

  while (integratedScanner.length < scanners.length - 1) {
    for (let secondScanner of scanners) {
      if (scannerZero !== secondScanner && !integratedScanner.includes(secondScanner)) {
        let foundOrientation: boolean = false
        for (let k = 0; k < allPossibleOrientations.length && !foundOrientation; k++) {
          const transformedPositions: Position[] = secondScanner.scannedProbes.map(position => {
            return {
              x: getTranslatedPosition(position, allPossibleOrientations[k].xReflects),
              y: getTranslatedPosition(position, allPossibleOrientations[k].yReflects),
              z: getTranslatedPosition(position, allPossibleOrientations[k].zReflects),
            }
          })

          for (let i = 0; i < transformedPositions.length && !foundOrientation; i++) {
            for (let j = 0; j < scannerZero.scannedProbes.length && !foundOrientation; j++) {
              const offset: Position = {
                x: transformedPositions[i].x - scannerZero.scannedProbes[j].x,
                y: transformedPositions[i].y - scannerZero.scannedProbes[j].y,
                z: transformedPositions[i].z - scannerZero.scannedProbes[j].z,
              }

              const offsetAppliedPositions: Position[] = transformedPositions.map(position => {
                return { x: position.x - offset.x, y: position.y - offset.y, z: position.z - offset.z }
              })

              const correspondingPositionsFound: number = offsetAppliedPositions.filter(position => scannerZero.scannedProbes.find(correctPosition => position.x === correctPosition.x && position.y === correctPosition.y && position.z === correctPosition.z)).length

              if (correspondingPositionsFound >= 12) {
                foundOrientation = true

                let i = 0
                for (let probePosition of offsetAppliedPositions) {
                  if (!scannerZero.scannedProbes.find(position => position.x === probePosition.x && position.y === probePosition.y && position.z === probePosition.z)) {
                    i++
                    scannerZero.scannedProbes.push(probePosition)
                  }
                }

                secondScanner.positionRelativeToScannerZero = offset

                integratedScanner.push(secondScanner)
              }
            }
          }
        }
      }
    }
  }

  return scanners
}

const goA = (input) => {
  const lines: string[] = splitToLines(input)
  let scanners: Scanner[] = parseScanner(lines)

  scanners = updateScanner(scanners)

  return scanners.find(scanner => scanner.id === 0).scannedProbes.length
}

const goB = (input) => {
  const lines: string[] = splitToLines(input)
  let scanners: Scanner[] = parseScanner(lines)

  scanners = updateScanner(scanners)

  let maximumManhattanDistance: number = Number.MIN_SAFE_INTEGER

  for (let scanner of scanners) {
    for (let secondScanner of scanners) {
      if (scanner !== secondScanner) {
        const manhattanDistance = Math.abs(scanner.positionRelativeToScannerZero.x - secondScanner.positionRelativeToScannerZero.x) + Math.abs(scanner.positionRelativeToScannerZero.y - secondScanner.positionRelativeToScannerZero.y) + Math.abs((scanner.positionRelativeToScannerZero.z - secondScanner.positionRelativeToScannerZero.z))
        if (manhattanDistance > maximumManhattanDistance) {
          maximumManhattanDistance = manhattanDistance
        }
      }
    }
  }

  return maximumManhattanDistance
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
