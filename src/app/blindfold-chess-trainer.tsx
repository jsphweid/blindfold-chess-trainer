import * as React from 'react'
import * as Chessboard from 'react-chess'
import { NotationType, PositionType } from './common/generatedTypes'
import ChessEngine from './chess-engine/chess-engine'
import { getReactChessStateFromFen } from './common/helpers'

export interface BlindfoldChessTrainerProps {
}

export interface BlindfoldChessTrainerState {
    allPositionsAsNotations: NotationType[]
    chessEngine: ChessEngine
}

export default class BlindfoldChessTrainer extends React.Component<BlindfoldChessTrainerProps, BlindfoldChessTrainerState> {

    constructor(props: BlindfoldChessTrainerProps) {

        super(props)

        this.state = {
            allPositionsAsNotations: Chessboard.getDefaultLineup(),
            chessEngine: new ChessEngine()
        }
        console.log('Chessboard.getDefaultLineup()', Chessboard.getDefaultLineup())

    }

    testRandomMoves = (num: number): void => {
        for (let i = 0; i < num; i++) {
            if (this.state.chessEngine.gameCanContinue()) {
                this.testRandomMove()
            } else {
                break
            }
        }
    }

    testRandomMove = (): void => {
        const moves: any[] = this.state.chessEngine.getAllPossibleMoves()
        const move = moves[Math.floor(Math.random() * moves.length)]
        const result = this.state.chessEngine.attemptMove(move)
        const currentStateAsFen: string = this.state.chessEngine.getCurrentStateAsFen()
        this.setState({ allPositionsAsNotations: getReactChessStateFromFen(currentStateAsFen) })
    }

    attemptToMovePiece = (): void => {
        console.log('what')
    }

    render() {
        this.state.chessEngine.getAllPossibleMoves()

        return (
            <div className="bct">
                <button onClick={this.attemptToMovePiece}>test move</button>
                <button onClick={() => this.testRandomMoves(3000)}>random move</button>
                <div className="bct-chessboard">
                    <Chessboard pieces={this.state.allPositionsAsNotations} />
                </div>
            </div>
        )

    }

}
