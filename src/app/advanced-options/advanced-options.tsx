import * as React from 'react'
import { defaultFenChessState } from '../common/constants'
import FenSection from '../fen-section/fen-section'

export interface AdvancedOptionsProps {
    playRandomGame: () => void
    handleLoadGameFromFen: (fen: string) => boolean
    fen: string
}

export interface AdvancedOptionsState {
    isShowing: boolean
}

export default class AdvancedOptions extends React.Component<AdvancedOptionsProps, AdvancedOptionsState> {

    constructor(props: AdvancedOptionsProps) {
        super(props)
        this.state = {
            isShowing: false
        }
    }

    renderAdvancedContent = (): JSX.Element => {
        return (
            <div className="bct-advancedOptions-content">
                <button onClick={this.props.playRandomGame}>Play Random Game</button>
                <button onClick={() => this.props.handleLoadGameFromFen(defaultFenChessState)}>Reset Game</button>
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
                <button onClick={() => this.setState({ isShowing: !this.state.isShowing })}>{this.state.isShowing ? 'Hide Advanced' : 'Show Advanced'}</button>
                {this.state.isShowing ? this.renderAdvancedContent() : null}
            </div>
        )
    }

}
