import * as React from 'react'
import * as Chessboard from 'react-chess'
import { NotationType } from './common/generatedTypes'
import ChessEngine from './chess-engine/chess-engine'
import { getReactChessStateFromFen } from './common/helpers'

export interface BlindfoldChessTrainerProps {
}

export interface BlindfoldChessTrainerState {
    allPositionsAsNotations: NotationType[]
    chessEngine: ChessEngine
    newMoveInput: string
    waitingToConfirmMove: boolean
    moveMessage: any
}

export default class BlindfoldChessTrainer extends React.Component<BlindfoldChessTrainerProps, BlindfoldChessTrainerState> {

    constructor(props: BlindfoldChessTrainerProps) {
        super(props)

        this.state = {
            allPositionsAsNotations: Chessboard.getDefaultLineup(),
            chessEngine: new ChessEngine(),
            newMoveInput: '',
            waitingToConfirmMove: false,
            moveMessage: null
        }
    }

    syncGameState = (): void => {
        const currentStateAsFen: string = this.state.chessEngine.getCurrentStateAsFen()
        this.setState({ allPositionsAsNotations: getReactChessStateFromFen(currentStateAsFen) })
    }

    randomOpponentMove = (): void => {
        const moves: any[] = this.state.chessEngine.getAllPossibleMoves()
        const move = moves[Math.floor(Math.random() * moves.length)]
        this.state.chessEngine.attemptMove(move)
        this.syncGameState()
    }

    confirmMove = (): void => {
        if (this.state.waitingToConfirmMove) {
            const result = this.state.chessEngine.attemptMove(this.state.newMoveInput)
            this.setState({ waitingToConfirmMove: false, moveMessage: result, newMoveInput: '' })
            this.syncGameState()
        } else {
            if (this.state.newMoveInput) {
                this.setState({ waitingToConfirmMove: true })
            } else {
                this.randomOpponentMove()
            }
        }
    }

    handleMoveInputChange = (event: any): void => {
        this.setState({ newMoveInput: event.currentTarget.value, waitingToConfirmMove: false })
    }

    renderInfo = (): JSX.Element => {
        const allPossiblePositions: string[] = this.state.chessEngine.getAllPossibleMoves()
        return (
            <div>
                <h1>{`It's ${this.state.chessEngine.isWhitesTurn() ? 'White\'s' : 'Black\'s' } turn!`}</h1>
                {allPossiblePositions.join(',')}
            </div>
        )
    }

    renderMoveInput = (): JSX.Element => {
        return (
            <div>
                <input
                    type="text"
                    value={this.state.newMoveInput}
                    onChange={this.handleMoveInputChange}
                    onKeyPress={(event: any) => (event.key === 'Enter') && this.confirmMove()}
                />
            </div>
        )
    }

    render() {

        return (
            <div className="bct">
                <button onClick={this.randomOpponentMove}>random move</button>
                <div className="bct-chessboard">
                    <Chessboard allowMoves={false} pieces={this.state.allPositionsAsNotations} />
                </div>
                {this.renderInfo()}
                {this.renderMoveInput()}
                {this.state.waitingToConfirmMove ? <h1>please confirm</h1> : null}
            </div>
        )

    }

}
