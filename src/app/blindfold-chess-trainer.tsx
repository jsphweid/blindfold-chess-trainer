import * as React from 'react'
import * as Chessboard from 'react-chess'
import { NotationType } from './common/generatedTypes'
import ChessEngine from './chess-engine/chess-engine'
import { getReactChessStateFromFen } from './common/helpers'
import { GameStateType } from './common/types'
import EndingOverlay from './ending-overlay/ending-overlay'

export interface BlindfoldChessTrainerProps {
}

export interface BlindfoldChessTrainerState {
    allPositionsAsNotations: NotationType[]
    chessEngine: ChessEngine
    newMoveInput: string
    waitingToConfirmMove: boolean
    errorMessage: any
    fenInput: string
    computerThinkingAboutNextMove: boolean
}

export default class BlindfoldChessTrainer extends React.Component<BlindfoldChessTrainerProps, BlindfoldChessTrainerState> {

    playInput: HTMLElement

    constructor(props: BlindfoldChessTrainerProps) {
        super(props)

        this.state = {
            allPositionsAsNotations: Chessboard.getDefaultLineup(),
            chessEngine: new ChessEngine(),
            newMoveInput: '',
            waitingToConfirmMove: false,
            errorMessage: null,
            fenInput: '',
            computerThinkingAboutNextMove: false
        }
    }

    syncGameState = (): void => {
        const currentStateAsFen: string = this.state.chessEngine.getCurrentStateAsFen()
        this.setState({ allPositionsAsNotations: getReactChessStateFromFen(currentStateAsFen) })
    }

    computerMakesAMove = (): void => {
        setTimeout(() => {
            this.setState({ computerThinkingAboutNextMove: true })
            setTimeout(() => {
                const moves: any[] = this.state.chessEngine.getAllPossibleMoves()
                const move = moves[Math.floor(Math.random() * moves.length)]
                this.state.chessEngine.move(move)
                this.syncGameState()
                this.tryToRefocusInput()
                this.setState({ computerThinkingAboutNextMove: false })
            }, 1000)
        }, 500)
    }

    handleEnter = (): void => {
        if (this.state.waitingToConfirmMove) {
            const result = this.state.chessEngine.move(this.state.newMoveInput)
            const errorMessage: string = result ? '' : 'Failed to move piece.'
            this.setState({ errorMessage, waitingToConfirmMove: false, newMoveInput: '' })
            this.syncGameState()
            if (!errorMessage) this.computerMakesAMove()
        } else {
            if (this.state.newMoveInput) {
                if (this.state.chessEngine.moveIsValid(this.state.newMoveInput)) {
                    this.setState({ waitingToConfirmMove: true })
                } else {
                    this.setState({ errorMessage: 'Move is invalid.' })
                }
            }
        }
    }

    tryToRefocusInput = (): void => {
        if (this.playInput) {
            this.playInput.blur()
            setTimeout(() => this.playInput.focus(), 10)
        }
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
                    ref={(input) => this.playInput = input}
                    type="text"
                    value={this.state.newMoveInput}
                    onChange={(e) => this.setState({ newMoveInput: e.currentTarget.value, waitingToConfirmMove: false })}
                    onKeyPress={(e) => (e.key === 'Enter') && this.handleEnter()}
                />
            </div>
        )
    }

    handleLoadGameFromFen = () => {
        const loadWasSuccessful = this.state.chessEngine.loadGameFromFenState(this.state.fenInput)
        const errorMessage: string = loadWasSuccessful ? '' : 'Could not load game from this FEN.'
        this.setState({ errorMessage })
        this.syncGameState()
        this.tryToRefocusInput()
    }

    renderFenStateAndLoader = (): JSX.Element => {
        return (
            <div>
                <div>Load game state from FEN</div>
                <input
                    type="text"
                    value={this.state.fenInput}
                    onChange={(e) => this.setState({ fenInput: e.currentTarget.value })}
                    onKeyPress={(e) => (e.key === 'Enter') && this.handleLoadGameFromFen()}
                />
                <div>Current game state as FEN</div>
                {this.state.chessEngine.getCurrentStateAsFen()}
            </div>
        )
    }

    render() {

        const gameState: GameStateType = this.state.chessEngine.getGameState()

        return (
            <div className="bct">
                <div className="bct-chessboard">
                    <Chessboard allowMoves={false} pieces={this.state.allPositionsAsNotations} />
                </div>
                {this.state.computerThinkingAboutNextMove ? <span style={{ fontSize: '20px' }}>Computer thinking...</span> : null}
                {this.renderInfo()}
                {this.renderMoveInput()}
                {this.state.waitingToConfirmMove ? <h1>please confirm</h1> : null}
                {this.renderFenStateAndLoader()}
                <span style={{ color: 'red', fontWeight: 'bold' }}>{this.state.errorMessage}</span>
                {gameState !== GameStateType.Playable ? <EndingOverlay gameState={gameState} /> : null}
            </div>
        )

    }

}
