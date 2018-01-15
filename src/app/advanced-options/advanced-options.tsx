import * as React from 'react'
import { defaultFenChessState } from '../common/constants'
import FenSection from '../fen-section/fen-section'

export interface AdvancedOptionsProps {
    playRandomGame: () => void
    handleLoadGameFromFen: (fen: string) => boolean
    fen: string
    boardShowing: boolean
    handleToggleBoardShowing: () => void
}

export interface AdvancedOptionsState {
    advancedOptionsShowing: boolean
}

export default class AdvancedOptions extends React.Component<AdvancedOptionsProps, AdvancedOptionsState> {

    constructor(props: AdvancedOptionsProps) {
        super(props)
        this.state = {
            advancedOptionsShowing: false
        }
    }

    renderAdvancedContent = (): JSX.Element => {
        return (
            <div className="bct-advancedOptions-content">
                <button onClick={this.props.playRandomGame}>Play Random Game</button>
                <button onClick={() => this.props.handleLoadGameFromFen(defaultFenChessState)}>Reset Game</button>
                <span>
                    Show Chessboard
                    <input
                        type="checkbox"
                        onChange={this.props.handleToggleBoardShowing}
                        checked={this.props.boardShowing}
                        name="Show Chessboard"
                    />
                </span>
                <FenSection
                    handleLoadGameFromFen={this.props.handleLoadGameFromFen}
                    currentBoardStateAsFen={this.props.fen}
                />
            </div>
        )
    }

    render() {
        return (
            <div className="bct-advancedOptions">
                <button
                    onClick={() => this.setState({ advancedOptionsShowing: !this.state.advancedOptionsShowing })}
                >{this.state.advancedOptionsShowing ? 'Hide Advanced' : 'Show Advanced'}</button>
                {this.state.advancedOptionsShowing ? this.renderAdvancedContent() : null}
            </div>
        )
    }

}
