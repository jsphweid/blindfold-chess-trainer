import * as React from 'react'
import * as Chessboard from 'react-chess'
import { NotationType } from './common/generatedTypes'
import ChessEngine from './chess-engine/chess-engine'
import { getReactChessStateFromFen } from './common/helpers'
import { GameStateType } from './common/types'
import EndingOverlay from './ending-overlay/ending-overlay'
import FenSection from './fen-section/fen-section'
import MoveInput from './move-input/move-input'

export interface BlindfoldChessTrainerProps {
}

export interface BlindfoldChessTrainerState {
    allPositionsAsNotations: NotationType[]
    chessEngine: ChessEngine
    waitingToConfirmMove: boolean
    errorMessage: any
    fenInput: string
    computerThinkingAboutNextMove: boolean
    resetMoveInput: boolean
}

export default class BlindfoldChessTrainer extends React.Component<BlindfoldChessTrainerProps, BlindfoldChessTrainerState> {

    constructor(props: BlindfoldChessTrainerProps) {
        super(props)

        this.state = {
            allPositionsAsNotations: Chessboard.getDefaultLineup(),
            chessEngine: new ChessEngine(),
            waitingToConfirmMove: false,
            errorMessage: null,
            fenInput: '',
            computerThinkingAboutNextMove: false,
            resetMoveInput: false
        }
    }

    syncGameState = (): void => {
        const currentStateAsFen: string = this.state.chessEngine.getCurrentStateAsFen()
        this.setState({ allPositionsAsNotations: getReactChessStateFromFen(currentStateAsFen), resetMoveInput: true })
    }

    computerMakesAMove = (): void => {
        setTimeout(() => {
            this.setState({ computerThinkingAboutNextMove: true })
            setTimeout(() => {
                const moves: any[] = this.state.chessEngine.getAllPossibleMoves()
                const move = moves[Math.floor(Math.random() * moves.length)]
                this.state.chessEngine.move(move)
                this.syncGameState()
                this.setState({ computerThinkingAboutNextMove: false })
            }, 1000)
        }, 500)
    }

    handleEnter = (move: string): void => {
        if (this.state.waitingToConfirmMove) {
            const result = this.state.chessEngine.move(move)
            const errorMessage: string = result ? '' : 'Failed to move piece.'
            this.setState({ errorMessage, waitingToConfirmMove: false })
            this.syncGameState()
            if (!errorMessage) this.computerMakesAMove()
        } else {
            if (move) {
                if (this.state.chessEngine.moveIsValid(move)) {
                    this.setState({ waitingToConfirmMove: true })
                } else {
                    this.setState({ errorMessage: 'Move is invalid.' })
                }
            }
        }
    }

    renderInfo = (): JSX.Element => {
        return (
            <div>
                <h1>{`It's ${this.state.chessEngine.isWhitesTurn() ? 'White\'s' : 'Black\'s' } turn!`}</h1>
            </div>
        )
    }

    handleLoadGameFromFen = (fen: string): void => {
        const loadWasSuccessful = this.state.chessEngine.loadGameFromFenState(fen)
        const errorMessage: string = loadWasSuccessful ? '' : 'Could not load game from this FEN.'
        this.setState({ errorMessage })
        this.syncGameState()
    }


    render() {

        const gameState: GameStateType = this.state.chessEngine.getGameState()

        return (
            <div className="bct">
                <div className="bct-chessboard">
                    <Chessboard allowMoves={false} pieces={this.state.allPositionsAsNotations} />
                </div>
                <div className="bct-info">
                    {this.state.computerThinkingAboutNextMove ? <span style={{ fontSize: '20px' }}>Computer thinking...</span> : null}
                    {this.renderInfo()}
                    <MoveInput
                        handleEnter={this.handleEnter}
                        resetMoveInput={this.state.resetMoveInput}
                        resetMoveInputComplete={() => this.setState({ resetMoveInput: false })}
                    />
                    {this.state.waitingToConfirmMove ? <h1>please confirm by hitting enter again</h1> : null}
                    <FenSection
                        handleLoadGameFromFen={this.handleLoadGameFromFen}
                        currentBoardStateAsFen={this.state.chessEngine.getCurrentStateAsFen()}
                    />
                    <span style={{ color: 'red', fontWeight: 'bold' }}>{this.state.errorMessage}</span>
                    {gameState !== GameStateType.Playable ? <EndingOverlay gameState={gameState} /> : null}
                </div>
            </div>
        )

    }

}
