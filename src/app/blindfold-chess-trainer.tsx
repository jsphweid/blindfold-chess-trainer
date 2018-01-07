import * as React from 'react'
import * as Chessboard from 'react-chess'
import { PieceObjType } from './common/types'
import { NotationType, PositionType } from './common/generatedTypes'
import ChessValidationEngine from './chess-validation-engine'

export interface BlindfoldChessTrainerProps {
}

export interface BlindfoldChessTrainerState {
    allPositionsAsNotations: NotationType[]
    chessValidationEngine: ChessValidationEngine
}

export default class BlindfoldChessTrainer extends React.Component<BlindfoldChessTrainerProps, BlindfoldChessTrainerState> {

    constructor(props: BlindfoldChessTrainerProps) {

        super(props)

        this.state = {
            allPositionsAsNotations: Chessboard.getDefaultLineup(),
            chessValidationEngine: new ChessValidationEngine()
        }

    }

    handleMovePiece = (piece: PieceObjType, fromSquare: PositionType, toSquare: PositionType) => {
        const newPieces = this.state.allPositionsAsNotations
            .map((pieceAndPositionInNotation: NotationType, index: number) => {
                if (piece.index === index) {
                    return `${piece.name}@${toSquare}`
                } else if (pieceAndPositionInNotation.indexOf(toSquare) === 2) {
                    return false
                }
                return pieceAndPositionInNotation
            })
            .filter(Boolean) as NotationType[]

        this.setState({ allPositionsAsNotations: newPieces })
    }

    render() {

        return (
            <div className="bct">
                <Chessboard pieces={this.state.allPositionsAsNotations} onMovePiece={this.handleMovePiece} />
                {this.state.chessValidationEngine.getAllPossibleMoves()}
            </div>
        )

    }

}
