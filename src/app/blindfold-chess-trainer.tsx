import * as React from 'react'
import * as Chessboard from 'react-chess'
import { NotationType } from './common/generatedTypes'
import ChessEngine from './chess-engine/chess-engine'
import { getReactChessStateFromFen } from './common/helpers'
import { GameStateType, MoveType } from './common/types'
import EndingOverlay from './ending-overlay/ending-overlay'
import MoveInput from './move-input/move-input'
import MoveSpeechInput from './move-speech-input/move-speech-input'
import ChessPlayground from './chess-engine/chess-playground'
import * as queryString from 'query-string'
import { defaultFenChessState } from './common/constants'
import AdvancedOptions from './advanced-options/advanced-options'

export interface BlindfoldChessTrainerProps {
}

export interface BlindfoldChessTrainerState {
    allPositionsAsNotations: NotationType[]
    waitingToConfirmMove: boolean
    moveErrorMessage: string
    computerThinkingAboutNextMove: boolean
    resetMoveInput: boolean
    blackMoveMessage: string
    boardShowing: boolean
    isSpeechInput: boolean
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
            resetMoveInput: false,
            boardShowing: true,
            isSpeechInput: true
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
                this.setState({ blackMoveMessage, resetMoveInput: true, computerThinkingAboutNextMove: false })
                setTimeout(() => this.setState({ blackMoveMessage: null }), 2000)
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

    handleEnter = (move: string, shouldConfirm: boolean = true): void => {
        if (this.state.waitingToConfirmMove || !shouldConfirm) {
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

    renderInputComponent = (): JSX.Element => {
        return this.state.isSpeechInput
            ? (
                <MoveSpeechInput
                    handleMoveSubmit={this.handleEnter}
                    resetWaitingToConfirm={this.handleResetWaitingToConfirm}
                    moveErrorMessage={this.state.moveErrorMessage}
                    blackMoveMessage={this.state.blackMoveMessage}
                    gameState={this.chessEngine.getCurrentStateAsFen()}
                    handleToggleSpeechInput={() => this.setState({ isSpeechInput: !this.state.isSpeechInput })}
                />
            ) : (
                <MoveInput
                    handleEnter={this.handleEnter}
                    resetMoveInput={this.state.resetMoveInput}
                    resetMoveInputComplete={() => this.setState({ resetMoveInput: false })}
                    moveErrorMessage={this.state.moveErrorMessage}
                    handleToggleSpeechInput={() => this.setState({ isSpeechInput: !this.state.isSpeechInput })}
                />
            )
    }

    render() {

        const gameState: GameStateType = this.chessEngine.getGameState()

        return (
            <div className="bct">
                <div className="bct-main">
                    <div className="bct-main-chessboard">
                        {this.state.boardShowing ? <Chessboard allowMoves={false} pieces={this.state.allPositionsAsNotations} /> : null}
                    </div>
                    {this.renderInputComponent()}
                </div>
                <div className="bct-info">
                    <p>
                        Voice Input: Commands like "Knight to h3" should suffice
                        in most cases. "Queen Side Castle" and "King Side Castle" work. Pawn promotion works best
                        when you say like "Pawn promotes to queen at a8."
                    </p>
                    <p>
                        Text Input: You can enter your move as text here. There are
                        <a href="https://github.com/jhlywa/chess.js/blob/master/README.md"> many supported conventions</a> but
                        the simplest to grasp by far is simply by indicating the 'from' square and the 'to' square: "a2a3"
                        (the piece at a2 goes to a3).
                    </p>
                    <p>
                        About: Idea and Implementation by <a href="https://www.josephweidinger.com">Joseph Weidinger</a>
                    </p>
                    {gameState !== GameStateType.Playable ? <EndingOverlay gameState={gameState} /> : null}
                    <AdvancedOptions
                        handleLoadGameFromFen={this.handleLoadGameFromFen}
                        playRandomGame={this.playRandomGame}
                        fen={this.chessEngine.getCurrentStateAsFen()}
                        boardShowing={this.state.boardShowing}
                        handleToggleBoardShowing={() => this.setState({ boardShowing: !this.state.boardShowing })}
                    />
                </div>
            </div>
        )

    }

}
