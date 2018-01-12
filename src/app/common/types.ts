import { PositionType } from './generatedTypes'

export enum GameStateType {
    Stalemate = 'The game has ended in a stalemate.',
    Checkmate = 'Checkmate!',
    ThreefoldRepetition = 'The game has ended because of the threefold repetition rule.',
    Draw = 'The game has ended in a draw.',
    Playable = 'The game is not over yet!'
}

export enum SpeechStateType {
    Listening = 'Listening...',
    Thinking = 'Thinking...',
    Speaking = 'Speaking...',
    Inactive = ''
}

export enum ProcessingResponseStateType {
    Incomprehensible = 'I\'m sorry, I couldn\'t understand that.',
    Invalid = 'That is not a valid move.',
    Successful = 'Success.'
}

export interface ReformulatedSpeechResultType {
    temps: string[]
    final: string[]
}

export interface KeyWordObjType {
    indexOfFirstLetter: number
    pieceOrPosition: SemiValidPieceOrPositionType
}

export interface ChessJSMoveDetailType {
    color: string
    from: string
    to: string
    flags: string
    piece: string
    san: string
}

export type PieceType = 'rook' | 'knight' | 'bishop' | 'king' | 'queen' | 'pawn'

export type WhitePieceLetterType = 'R' | 'N' | 'B' | 'K' | 'Q' | 'P'
export type BlackPieceLetterType = 'r' | 'n' | 'b' | 'k' | 'q' | 'p'
export type PieceLetterType = WhitePieceLetterType | BlackPieceLetterType

export interface ProcessingResponseType {
    responseType: ProcessingResponseStateType
    refinedMove: RefinedMoveType
}

export interface RefinedMoveType {
    rawMove: string
    descriptiveMove: string
}

export interface MoveType {
    from: ValidPieceOrPositionType
    to: PositionType
}

export type SemiValidPieceOrPositionType = any // for now...
export type ValidPieceOrPositionType = PositionType | 'rook' | 'knight' | 'bishop' | 'queen' | 'king' | 'pawn'

// export type FoundPositionOrPieceType =
