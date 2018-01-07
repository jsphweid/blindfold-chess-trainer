const ChessEngineLibrary = require('./chess-engine-library')

export default class ChessEngine {

    private chessEngine: any

    constructor() {
        this.chessEngine = new ChessEngineLibrary()
    }

    public getAllPossibleMoves(): string[] {
        return this.chessEngine.moves()
    }

    public attemptMove(move: any): any {
        return this.chessEngine.move(move)
    }

    public getCurrentStateAsFen(): string {
        return this.chessEngine.fen()
    }

    public gameCanContinue(): boolean {
        switch (true) {
            case this.chessEngine.in_stalemate():
                console.log('in stalemate')
                return false
            case this.chessEngine.in_checkmate():
                console.log('in checkmate')
                return false
            case this.chessEngine.in_threefold_repetition():
                console.log('in threefold repetition')
                return false
            case this.chessEngine.in_draw():
                console.log('in draw')
                return false
            case this.chessEngine.game_over():
                console.log('game over')
                return false
            default:
                return true
        }
    }

    public isWhitesTurn(): boolean {
        return this.chessEngine.turn() === 'w'
    }

}
