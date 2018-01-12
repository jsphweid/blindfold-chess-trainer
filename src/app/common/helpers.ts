import { NotationType, PositionType } from './generatedTypes'
import {
    ReformulatedSpeechResultType, ChessJSMoveDetailType, KeyWordObjType,
    ValidPieceOrPositionType, SemiValidPieceOrPositionType, PieceLetterType, WhitePieceLetterType,
    BlackPieceLetterType, MoveType, ProcessingResponseType, ProcessingResponseStateType, PieceType
} from './types'
import { semiValidPositionsAndPieces, positions, pieces } from './constants'
import {
    determinePawnStartingSquare, determineWhichSquareIsValidMove,
    getDescriptiveMove
} from '../chess-engine/chess-validator'

export const getCharAsNumber = (char: string): number => parseInt(char, 10)
export const charIsNumber = (char: string): boolean => !!parseInt(char, 10)

export const getReactChessStateFromFen = (fen: string): NotationType[] => {
    const positionPortionOfFen: string = fen.split(' ')[0]
    const rows: string[] = positionPortionOfFen.split('/')
    const ret: NotationType[] = []    
    rows.forEach((row: string, index: number) => {
        const letters: string[] = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
        const rowNumTranslated: number = 8 - index
        let indexWithinRow: number = 0
        const rowAsCharArray: string[] = row.split('')
        rowAsCharArray.forEach((char: string) => {
            if (charIsNumber(char)) {
                indexWithinRow += getCharAsNumber(char)
            } else {
                ret.push(`${char}@${letters[indexWithinRow]}${rowNumTranslated}` as NotationType)
                indexWithinRow++
            }
        })
        
    })
    return ret
}

// TODO: if training a model some day, get the confidences from each result along with
// the transcript to predict based on pure text

export const reformulateSpeechEvents = (results: SpeechRecognitionResult[]): ReformulatedSpeechResultType => {
    const reformulated: ReformulatedSpeechResultType = { final: [], temps: [] }
    results.forEach((result: SpeechRecognitionResult) => {
        for (let i = 0; i < result.length; i++) {
            const transcript: string = result[i].transcript
            const bucket = result.isFinal ? 'final' : 'temps'
            reformulated[bucket].push(transcript)
        }
    })
    return reformulated
}

export const tryToFindKeyWords = (str: string): SemiValidPieceOrPositionType[] => {
    const lowerCasedResult: string = ` ${str.toLowerCase()} `
    const keyWordObjs: KeyWordObjType[] = []
    semiValidPositionsAndPieces.forEach((pieceOrPosition: SemiValidPieceOrPositionType) => {
        const indexOfFirstLetter: number = lowerCasedResult.indexOf(` ${pieceOrPosition} `)
        if (indexOfFirstLetter !== -1) keyWordObjs.push({ indexOfFirstLetter, pieceOrPosition })
    })
    return keyWordObjs
        .sort((a, b) => a.indexOfFirstLetter - b.indexOfFirstLetter)
        .map((keyWord: KeyWordObjType) => keyWord.pieceOrPosition)
}

const cleanAllKeyWords = (keyWords: SemiValidPieceOrPositionType[]): ValidPieceOrPositionType[] => {
    return keyWords.map((keyWord: SemiValidPieceOrPositionType) => {
        return keyWord as ValidPieceOrPositionType // magic for now
    })
}

const getPieceLetter = (piece: PieceType, color = 'white'): PieceLetterType => {
    const pieceAbbrievMap: any = {
        'rook': 'r',
        'knight': 'n',
        'queen': 'q',
        'king': 'k',
        'pawn': 'p',
        'bishop': 'b'
    }
    const abbriev: string = pieceAbbrievMap[piece]
    return (color === 'white')
        ? abbriev.toUpperCase() as WhitePieceLetterType
        : abbriev as BlackPieceLetterType
}

export const getPieceFromLetter = (letter: PieceLetterType): PieceType => {
    const abbrievPieceMap: any = {
        'r': 'rook',
        'n': 'knight',
        'q': 'queen',
        'k': 'king',
        'p': 'pawn',
        'b': 'bishop'
    }
    return abbrievPieceMap[letter.toLowerCase()]
}

const isPiece = (possiblePiece: any): boolean => pieces.indexOf(possiblePiece) !== -1
const isPosition = (possiblePosition: any): boolean => positions.indexOf(possiblePosition) !== -1

export const addRowValues = (str: string): number => {
    let sum: number = 0
    for (const char of str) {
        const intParsed = parseInt(char, 10)
        if (intParsed)
            sum += intParsed
        else
            sum ++
    }
    return sum
}

export const findAllSquaresPieceIsOn = (piece: PieceType, gameState: string): PositionType[] => {
    const pieceLetter: PieceLetterType = getPieceLetter(piece)
    const splitGameState: string[] = gameState.split(' ')[0].split('/')
    const positions = [] as PositionType[]
    splitGameState.forEach((row: string, rowNumber: number) => {
        for (let i = 0; i < row.length; i++) {
            if (pieceLetter === row[i]) {
                const xPosition: string = 'abcdefgh'[addRowValues(row.slice(0, i))]
                const yPosition: number = 8 - rowNumber
                positions.push(`${xPosition}${yPosition}` as PositionType)
            }
        }
    })
    return positions.sort()
}

export const determineStartingSquare = (move: MoveType, gameState: string): PositionType => {
    if (isPosition(move.from))
        return move.from as PositionType

    const matchingSquares = findAllSquaresPieceIsOn(move.from as PieceType, gameState)

    switch (matchingSquares.length) {
        default:
        case 0:
            return null
        case 1:
            return matchingSquares[0]
        case 2:
            return determineWhichSquareIsValidMove(matchingSquares, move.to as PositionType, gameState) // assumes second one is position
    }
}

export const getRawMove = (move: MoveType, gameState: string): MoveType => {
    const startingSquare: PositionType = move.from
        ? determineStartingSquare(move, gameState)
        : determinePawnStartingSquare(move.to, gameState)

    return startingSquare ? { from: startingSquare, to: move.to } : null
}

export const computerGuess = (rawResults: string[], gameState: string): ProcessingResponseType => {
    const bestGuess: SemiValidPieceOrPositionType[] = rawResults
        .map((result: string) => tryToFindKeyWords(result))
        .filter((semiValidPositions: SemiValidPieceOrPositionType[]) => semiValidPositions.length > 0)
        .filter((semiValidPositions: SemiValidPieceOrPositionType[]) => !(semiValidPositions.length === 1 && !isPosition(semiValidPositions[0])))
        .sort((a, b) => b.length - a.length)
        [0]

    if (!bestGuess)
        return { responseType: ProcessingResponseStateType.Incomprehensible, refinedMove: null }

    const bestGuessCleaned: ValidPieceOrPositionType[] = cleanAllKeyWords(bestGuess)
        .filter((item, index, arr) => index === 0 || index === (arr.length - 1))

    const cleanedMove: MoveType = bestGuessCleaned.length === 2
        ? { from: bestGuessCleaned[0], to: bestGuessCleaned[1] as PositionType }
        : { from: null, to: bestGuessCleaned[0] as PositionType }

    const rawMove: MoveType = getRawMove(cleanedMove, gameState)

    if (!rawMove)
        return { responseType: ProcessingResponseStateType.Invalid, refinedMove: null }

    const descriptiveMove: string = getDescriptiveMove(rawMove, gameState)

    return { responseType: ProcessingResponseStateType.Successful, refinedMove: { descriptiveMove, rawMove: `${rawMove.from}${rawMove.to}` } }
}


export const generateConfirmMessage = (move: string): string => {
    return `${move.slice(0, 2)} goes to ${move.slice(2, 4)}?`
}

export const generateBlackMoveMessage = (moveDetail: ChessJSMoveDetailType): string => {
    return `Black moves from ${moveDetail.from} to ${moveDetail.to}.`
}
