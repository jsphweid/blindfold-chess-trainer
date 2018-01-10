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

export interface ReformulatedSpeechResultType {
    temps: string[]
    final: string[]
}

export interface KeyWordType {
    indexOfFirstLetter: number
    position: PositionType
}

export interface ChessJSMoveDetailType {
    color: string
    from: string
    to: string
    flags: string
    piece: string
    san: string
}

export type ValidPieceOrPositionType = PositionType | 'rook' | 'knight' | 'bishop' | 'queen' | 'king' | 'pawn'

// export type FoundPositionOrPieceType =
