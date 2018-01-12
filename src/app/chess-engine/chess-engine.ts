import { GameStateType, ChessJSMoveDetailType } from '../common/types'

const ChessEngineLibrary = require('./chess-engine-library')

export const MOVE_OPTIONS = {
    sloppy: true
}

export default class ChessEngine {

    private chessEngine: any

    constructor() {
        this.chessEngine = new ChessEngineLibrary()
    }

    public getAllPossibleMoves(): string[] {
        return this.chessEngine.moves()
    }

    public move(move: string): ChessJSMoveDetailType {
        return this.chessEngine.move(move, MOVE_OPTIONS)
    }

    public getCurrentStateAsFen(): string {
        return this.chessEngine.fen()
    }

    public loadGameFromFenState(fen: string): boolean {
        return this.chessEngine.load(fen)
    }

    public moveIsValid(move: string): boolean {
        const success: boolean = this.chessEngine.move(move, MOVE_OPTIONS)
        if (success) {
            this.chessEngine.undo()
            return true
        } else {
            return false
        }
    }

    public getGameState(): GameStateType {
        switch (true) {
            case this.chessEngine.in_stalemate():
                return GameStateType.Stalemate
            case this.chessEngine.in_checkmate():
                return GameStateType.Checkmate
            case this.chessEngine.in_threefold_repetition():
                return GameStateType.ThreefoldRepetition
            case this.chessEngine.in_draw():
                return GameStateType.Draw
            default:
                return GameStateType.Playable
        }
    }

    public isWhitesTurn(): boolean {
        return this.chessEngine.turn() === 'w'
    }

}
