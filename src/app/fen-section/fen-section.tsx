import * as React from 'react'

export interface FenSectionProps {
    handleLoadGameFromFen: (fen: string) => void
    currentBoardStateAsFen: string
}

export interface FenSectionState {
    fenInput: string
}

export default class FenSection extends React.Component<FenSectionProps, FenSectionState> {

    constructor(props: FenSectionProps) {
        super(props)

        this.state = {
            fenInput: ''
        }
    }

    render() {
        return (
            <div className="bct-fenSection">
                <div className="bct-fenSection-display">
                    <div>Current game state as FEN</div>
                    <div>{this.props.currentBoardStateAsFen}</div>
                </div>
                <div className="bct-fenSection-load">
                    <div>Load game state from FEN</div>
                    <input
                        type="text"
                        value={this.state.fenInput}
                        onChange={(e) => this.setState({ fenInput: e.currentTarget.value })}
                        onKeyPress={(e) => (e.key === 'Enter') && this.props.handleLoadGameFromFen(this.state.fenInput)}
                    />
                </div>
            </div>
        )
    }

}
