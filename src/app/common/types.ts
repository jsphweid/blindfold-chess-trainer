import { PositionType, NotationType } from './generatedTypes'

export type BlackPieceNameType = 'p' | 'r' | 'n' | 'b' | 'k' | 'q'
export type WhitePieceNameType = 'P' | 'R' | 'N' | 'B' | 'K' | 'Q'
export type PieceNameType = BlackPieceNameType | WhitePieceNameType

export interface ReactChessPieceObjType {
    name: PieceNameType
    position: PositionType
    index: number
    notation: NotationType
}
