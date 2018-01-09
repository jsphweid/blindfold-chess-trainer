export enum GameStateType {
    Stalemate = 'The game has ended in a stalemate.',
    Checkmate = 'Checkmate!',
    ThreefoldRepetition = 'The game has ended because of the threefold repetition rule.',
    Draw = 'The game has ended in a draw.',
    Playable = 'The game is not over yet!'
}

export interface SpeechResultType {
    temps: string[]
    final: string
}
