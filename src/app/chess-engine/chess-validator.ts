import { PositionType } from '../common/generatedTypes'
import { MOVE_OPTIONS } from './chess-engine'
import { MoveType, PieceLetterType, PieceType } from '../common/types'
import { getPieceFromLetter } from '../common/helpers'

const ChessEngineLibrary = require('./chess-engine-library')

export const determineWhichSquareIsValidMove = (positions: PositionType[], toSquare: PositionType, someFen: string): PositionType => {

    const chessValidator: any = new ChessEngineLibrary()

    const possibleGoodPosition: PositionType = positions
        .filter((position: PositionType) => {
            chessValidator.load(someFen)
            return chessValidator.move(`${position}${toSquare}`, MOVE_OPTIONS)
        })
        [0]

    return possibleGoodPosition || null

}

export const determinePawnStartingSquare = (position: PositionType, gameState: string, isWhite: boolean = true): PositionType => {
    const chessValidator: any = new ChessEngineLibrary()
    const num = parseInt(position[1], 10) as number
    let startingSquare: PositionType = null
    for (let i = 2; i > 0; i--) {
        chessValidator.load(gameState)
        const modifier = isWhite ? i * -1 : i
        const thisStartingSquare = `${position[0]}${num + modifier}` as PositionType
        const success = chessValidator.move(`${thisStartingSquare}${position}`, MOVE_OPTIONS)
        if (success) startingSquare = thisStartingSquare
    }
    return startingSquare
}

export const getDescriptiveMove = (rawMove: MoveType, gameState: string): string => {
    const chessValidator: any = new ChessEngineLibrary()
    chessValidator.load(gameState)

    const descriptiveFrom: PieceType = rawMove.from
        ? getPieceFromLetter(chessValidator.get(rawMove.from).type)
        : 'pawn'

    const pieceAtRawMoveTo: PieceLetterType = chessValidator.get(rawMove.to) && chessValidator.get(rawMove.to).type

    const descriptiveTo: PieceType | PositionType = pieceAtRawMoveTo
        ? getPieceFromLetter(pieceAtRawMoveTo)
        : rawMove.to

    return pieceAtRawMoveTo
        ? `${descriptiveFrom} takes ${descriptiveTo} at ${rawMove.to}?`
        : `${descriptiveFrom} moves to ${rawMove.to}?`
}
