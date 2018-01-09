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

export interface FoundPositionType {
    indexOfFirstLetter: number
    position: PositionType
}
