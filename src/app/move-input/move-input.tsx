import * as React from 'react'

export interface MoveInputProps {
    handleEnter: (newMoveInput: string) => void
        resetMoveInput: boolean
    resetMoveInputComplete: () => void
}

export interface MoveInputState {
    newMoveInput: string
}

export default class MoveInput extends React.Component<MoveInputProps, MoveInputState> {

    moveInput: HTMLElement

    constructor(props: MoveInputProps) {
        super(props)

        this.state = {
            newMoveInput: ''
        }
    }

    componentWillReceiveProps(props: MoveInputProps) {
        if (props.resetMoveInput) {
            this.tryToRefocusInput()
            this.setState({ newMoveInput: '' })
            this.props.resetMoveInputComplete()
        }
    }

    tryToRefocusInput = (): void => {
        if (this.moveInput) {
            this.moveInput.blur()
            setTimeout(() => this.moveInput.focus(), 10)
        }
    }

    render() {
        return (
            <div className="bct-moveInput">
                <div className="bct-moveInput-instructions">
                    <p>
                        TL;DR Type in your move (example: 'a2a3') and hit enter.
                    </p>
                    <p>
                        You can enter your move as text here. There are <a href="https://github.com/jhlywa/chess.js/blob/master/README.md">
                        many supported conventions</a> but the simplest to grasp by far is simply by indicating the 'from' square and the
                        'to' square: "a2a3" (the piece at a2 goes to a3).
                    </p>
                </div>
                <input
                    ref={(input) => this.moveInput = input}
                    type="text"
                    value={this.state.newMoveInput}
                    onChange={(e) => this.setState({ newMoveInput: e.currentTarget.value })}
                    onKeyPress={(e) => (e.key === 'Enter') && this.props.handleEnter(this.state.newMoveInput)}
                />
            </div>
        )
    }

}
