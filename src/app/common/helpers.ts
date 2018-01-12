import { NotationType, PositionType, PieceType } from './generatedTypes'
import {
    ReformulatedSpeechResultType, ChessJSMoveDetailType, KeyWordObjType,
    ValidPieceOrPositionType, SemiValidPieceOrPositionType, MoveObjectType, PieceLetterType, WhitePieceLetterType, BlackPieceLetterType
} from './types'
import { semiValidPositionsAndPieces, positions, pieces } from './constants'
import { PieceLetterType } from './types'

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

export const determineStartingSquare = (moves: ValidPieceOrPositionType[], gameState: string): PositionType => {
    if (isPosition(moves[0]))
        return moves[0] as PositionType

}

export const getRawMove = (moves: ValidPieceOrPositionType[], gameState: string): ValidPieceOrPositionType[] => {
    // just confirm the move.... let the validation engine to do rest....
    if (moves.length === 1) return moves

    // if it is in positions, just pass it through and another function will assume it's a pawn
    moves.map((move: ValidPieceOrPositionType) => {})


    // if (moves.length === 1) {
    //     // unshift pawn, not text, the actual position
    //     const desiredSquare: PositionType = moves[0]
    // }
    // if length 1, then assume pawn
    return 'test'
}

export const computerMVPGuess = (rawResults: string[], gameState: string): MoveObjectType => {
    const bestGuess: SemiValidPieceOrPositionType[] = rawResults
        .map((result: string) => tryToFindKeyWords(result))
        .filter((semiValidPositions: SemiValidPieceOrPositionType[]) => semiValidPositions.length === 1 || semiValidPositions.length === 2)
        .sort((a, b) => b.length - a.length)
        [0]

    if (!bestGuess)
        return { rawMove: '', descriptiveMove: '' }

    const bestGuessCleaned: ValidPieceOrPositionType[] = cleanAllKeyWords(bestGuess)
    // change to raw positions using game state => raw move
    const validPiecesAndPositions: ValidPieceOrPositionType = getRawMove(bestGuessCleaned, gameState)
    // if 
    
    // get descriptive moves by using game state

    return 
}

// write tests around `this above....

// switch (keyWords.length) {
//     default:
//     case 1:
//         break // temp, handle pawn movements...
//     case 2:
//         const cleanedWords =
//             ret = keyWords.map((foundPosition: FoundPositionType) => foundPosition.position).join('')
//         break
//     case 0:
//         break
// }

///////////////// LEGACY
// export const computerMVPGuess = (rawResults: string[]): string => {
//     let ret: string = null
//     rawResults.forEach((result: string) => {
//         const foundPositions = [] as FoundPositionType[]
//         positions.forEach((position: PositionType) => {
//             const indexOfFirstLetter: number = result.indexOf(position)
//             if (indexOfFirstLetter !== -1) foundPositions.push({ indexOfFirstLetter, position })
//         })
//         if (foundPositions.length === 2) {
//             foundPositions.sort((a, b) => a.indexOfFirstLetter - b.indexOfFirstLetter)
//             ret = foundPositions.map((foundPosition: FoundPositionType) => foundPosition.position).join('')
//         }
//     })
//     return ret
// }

export const generateConfirmMessage = (move: string): string => {
    return `${move.slice(0, 2)} goes to ${move.slice(2, 4)}?`
}

export const generateBlackMoveMessage = (moveDetail: ChessJSMoveDetailType): string => {
    return `Black moves from ${moveDetail.from} to ${moveDetail.to}.`
}
