import { PositionType, NotationType } from './generatedTypes'
import { PieceNameType, ReactChessPieceObjType } from './types'

interface ReactChessMoveType {
    piece: ReactChessPieceObjType
    fromSquare: PositionType
    toSquare: PositionType
}

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
