import { NotationType } from './generatedTypes'
import { ChessJSMoveDetailType, PieceLetterType, WhitePieceLetterType, BlackPieceLetterType, PieceType, ColorType } from './types'
import { positions, pieces } from './constants'

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

export const getPieceLetter = (piece: PieceType, color: ColorType = 'white'): PieceLetterType => {
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

export const isPiece = (possiblePiece: any): boolean => pieces.indexOf(possiblePiece) !== -1
export const isPosition = (possiblePosition: any): boolean => positions.indexOf(possiblePosition) !== -1

export const generateBlackMoveMessage = (moveDetail: ChessJSMoveDetailType): string => {
    return `Black moves from ${moveDetail.from} to ${moveDetail.to}.`
}
