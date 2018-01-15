import * as React from 'react'

export interface MoveInputProps {
    handleEnter: (newMoveInput: string, shouldConfirm?: boolean) => void
    resetMoveInput: boolean
    resetMoveInputComplete: () => void
    moveErrorMessage: string
    handleToggleSpeechInput: () => void
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
               <div className="bct-moveInput-titleAndSwitch">
                    <h2>Practice Using Keyboard</h2>
                    <button onClick={this.props.handleToggleSpeechInput}>Switch to Speech Input</button>
                </div>
                <div className="bct-moveInput-instructions">
                    <strong>Type in your move (example: 'a2a3') and hit enter or press button.</strong>
                </div>
                <input
                    ref={(input) => this.moveInput = input}
                    type="text"
                    value={this.state.newMoveInput}
                    onChange={(e) => this.setState({ newMoveInput: e.currentTarget.value })}
                    onKeyPress={(e) => (e.key === 'Enter') && this.props.handleEnter(this.state.newMoveInput, false)}
                />
                <button onClick={() => this.props.handleEnter(this.state.newMoveInput, false)}>Move</button>
                <div className="bct-moveInput-errorMessage">
                    {this.props.moveErrorMessage}
                </div>
            </div>
        )
    }

}
