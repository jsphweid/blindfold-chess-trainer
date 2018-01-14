import * as React from 'react'
import * as Chessboard from 'react-chess'
import { NotationType } from './common/generatedTypes'
import ChessEngine from './chess-engine/chess-engine'
import { getReactChessStateFromFen } from './common/helpers'
import { GameStateType, MoveType } from './common/types'
import EndingOverlay from './ending-overlay/ending-overlay'
import FenSection from './fen-section/fen-section'
import MoveInput from './move-input/move-input'
import MoveSpeechInput from './move-speech-input/move-speech-input'
import ChessPlayground from './chess-engine/chess-playground'
import * as queryString from 'query-string'
import { defaultFenChessState } from './common/constants'

export interface BlindfoldChessTrainerProps {
}

export interface BlindfoldChessTrainerState {
    allPositionsAsNotations: NotationType[]
    waitingToConfirmMove: boolean
    moveErrorMessage: string
    computerThinkingAboutNextMove: boolean
    resetMoveInput: boolean
    blackMoveMessage: string
}

export default class BlindfoldChessTrainer extends React.Component<BlindfoldChessTrainerProps, BlindfoldChessTrainerState> {

    chessEngine: ChessEngine = new ChessEngine()

    constructor(props: BlindfoldChessTrainerProps) {
        super(props)

        this.state = {
            allPositionsAsNotations: Chessboard.getDefaultLineup(),
            waitingToConfirmMove: false,
            moveErrorMessage: '',
            blackMoveMessage: '',
            computerThinkingAboutNextMove: false,
            resetMoveInput: false
        }
    }

    componentDidMount() {
        const params = queryString.parse(location.search)
        if (params.fen)
            this.handleLoadGameFromFen(params.fen)
        else
            this.updateFenSearchParam(defaultFenChessState)
    }

    updateFenSearchParam = (fen: string): void => {
        const searchParamObject = {
            ...queryString.parse(location.search),
            fen
        }
        history.pushState({}, null, `?${queryString.stringify(searchParamObject)}`)
    }

    syncGameState = (): void => {
        const currentStateAsFen: string = this.chessEngine.getCurrentStateAsFen()
        this.updateFenSearchParam(currentStateAsFen)
        this.setState({ allPositionsAsNotations: getReactChessStateFromFen(currentStateAsFen) })
    }

    computerMakesAMove = (): void => {
        setTimeout(() => {
            this.setState({ computerThinkingAboutNextMove: true })
            setTimeout(() => {
                const moves: string[] = this.chessEngine.getAllPossibleMoves()
                const move: string = moves[Math.floor(Math.random() * moves.length)]
                const fenBeforeMove: string = this.chessEngine.getCurrentStateAsFen()
                const { from, to } = this.chessEngine.move(move)
                const playground = new ChessPlayground()
                const blackMoveMessage = `black ${playground.getDescriptiveMove({ from, to } as MoveType, fenBeforeMove)}`
                this.syncGameState()
                this.setState({ blackMoveMessage, computerThinkingAboutNextMove: false })
            }, 1000)
        }, 500)
    }

    playRandomGame = (): void => {
        setTimeout(() => {
            const moves: any[] = this.chessEngine.getAllPossibleMoves()
            const move = moves[Math.floor(Math.random() * moves.length)]
            this.chessEngine.move(move)
            this.syncGameState()
            if (this.chessEngine.getGameState() === GameStateType.Playable) {
                this.playRandomGame()
            }
        }, 10)
    }

    handleEnter = (move: string): void => {
        if (this.state.waitingToConfirmMove) {
            const result = this.chessEngine.move(move)
            const moveErrorMessage: string = result ? '' : 'Failed to move piece.'
            this.setState({ moveErrorMessage, waitingToConfirmMove: false })
            this.syncGameState()
            if (!moveErrorMessage) this.computerMakesAMove()
        } else {
            if (move) {
                if (this.chessEngine.moveIsValid(move)) {
                    this.setState({ waitingToConfirmMove: true, moveErrorMessage: '' })
                } else {
                    this.setState({ moveErrorMessage: `That's not a valid move...` })
                }
            } else {
                this.setState({ moveErrorMessage: 'Please enter a move...' })
            }
        }
    }

    handleLoadGameFromFen = (fen: string): boolean => {
        const loadWasSuccessful = this.chessEngine.loadGameFromFenState(fen)
        this.syncGameState()
        return loadWasSuccessful
    }

    handleResetWaitingToConfirm = (): void => this.setState({ waitingToConfirmMove: false })

    renderWhoseTurn = (): JSX.Element => {
        return (
            <div>
                <h1>{`It's ${this.chessEngine.isWhitesTurn() ? 'White\'s' : 'Black\'s' } turn!`}</h1>
            </div>
        )
    }

    render() {

        const gameState: GameStateType = this.chessEngine.getGameState()

        return (
            <div className="bct">
                <div className="bct-chessboard">
                    <button onClick={this.playRandomGame}>Play Random Game</button>
                    <button onClick={() => this.handleLoadGameFromFen(defaultFenChessState)}>Reset Game</button>
                    <Chessboard allowMoves={false} pieces={this.state.allPositionsAsNotations} />
                    <MoveSpeechInput
                        handleMoveSubmit={this.handleEnter}
                        resetWaitingToConfirm={this.handleResetWaitingToConfirm}
                        moveErrorMessage={this.state.moveErrorMessage}
                        blackMoveMessage={this.state.blackMoveMessage}
                        gameState={this.chessEngine.getCurrentStateAsFen()}
                    />
                </div>
                <div className="bct-info">
                    {this.state.computerThinkingAboutNextMove ? <span style={{ fontSize: '20px' }}>Computer thinking...</span> : null}
                    {this.renderWhoseTurn()}
                    <MoveInput
                        handleEnter={this.handleEnter}
                        resetMoveInput={this.state.resetMoveInput}
                        resetMoveInputComplete={() => this.setState({ resetMoveInput: false })}
                        moveErrorMessage={this.state.moveErrorMessage}
                    />
                    {this.state.waitingToConfirmMove ? <h1>please confirm by hitting enter again</h1> : null}
                    <FenSection
                        handleLoadGameFromFen={this.handleLoadGameFromFen}
                        currentBoardStateAsFen={this.chessEngine.getCurrentStateAsFen()}
                    />
                    {gameState !== GameStateType.Playable ? <EndingOverlay gameState={gameState} /> : null}
                </div>
            </div>
        )

    }

}
