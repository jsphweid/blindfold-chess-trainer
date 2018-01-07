const ChessEngine = require('./chess-validation-library')

export default class ChessValidationEngine {

    private chessEngine: any

    constructor() {
        this.chessEngine = new ChessEngine()
    }

    public getAllPossibleMoves(): any {
        return this.chessEngine.moves()
    }

}
