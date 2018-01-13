import { PositionType } from '../common/generatedTypes'
import { MOVE_OPTIONS } from './chess-engine'
import { MoveType, PieceLetterType, PieceType } from '../common/types'
import { getPieceFromLetter } from '../common/helpers'

const ChessEngineLibrary = require('./chess-engine-library')

export default class ChessPlayground {

    private chessEngine: any

    constructor() {
        this.chessEngine = new ChessEngineLibrary()
    }

    determineWhichSquareIsValidMove(positions: PositionType[], toSquare: PositionType, someFen: string): PositionType {
        const possibleGoodPosition: PositionType = positions
            .filter((position: PositionType) => {
                this.chessEngine.load(someFen)
                return this.chessEngine.move(`${position}${toSquare}`, MOVE_OPTIONS)
            })
            [0]

        return possibleGoodPosition || null
    }

    determinePawnStartingSquare(position: PositionType, gameState: string): PositionType {
        const num = parseInt(position[1], 10) as number
        let startingSquare: PositionType = null
        for (let i = 2; i > 0; i--) {
            this.chessEngine.load(gameState)
            const isWhite: boolean = this.chessEngine.turn() === 'w'
            const modifier = isWhite ? i * -1 : i
            const thisStartingSquare = `${position[0]}${num + modifier}` as PositionType
            const success = this.chessEngine.move(`${thisStartingSquare}${position}`, MOVE_OPTIONS)
            if (success) startingSquare = thisStartingSquare
        }

        return startingSquare
    }

    getDescriptiveMove(rawMove: MoveType, gameState: string): string {
        this.chessEngine.load(gameState)

        const descriptiveFrom: PieceType = rawMove.from
            ? getPieceFromLetter(this.chessEngine.get(rawMove.from).type)
            : 'pawn'

        const pieceAtRawMoveTo: PieceLetterType = this.chessEngine.get(rawMove.to) && this.chessEngine.get(rawMove.to).type

        const descriptiveTo: PieceType | PositionType = pieceAtRawMoveTo
            ? getPieceFromLetter(pieceAtRawMoveTo)
            : rawMove.to

        return pieceAtRawMoveTo
            ? `${descriptiveFrom} takes ${descriptiveTo} at ${rawMove.to}?`
            : `${descriptiveFrom} moves to ${rawMove.to}?`
    }

}
