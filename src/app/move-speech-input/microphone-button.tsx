import * as React from 'react'
import { SpeechStateType } from '../common/types'

const microphone = require('../assets/microphone.svg')

const { Thinking, Inactive } = SpeechStateType

export interface MicrophoneButtonProps {
    speechState: SpeechStateType
    handleUnclicked: () => void
    handleClicked: () => void
}

export interface MicrophoneButtonState {
    mouseIsDepressed: boolean
    blockNewClick: boolean
}

export default class MicrophoneButton extends React.Component<MicrophoneButtonProps, MicrophoneButtonState> {

    constructor(props: MicrophoneButtonProps) {
        super(props)
        this.state = {
            mouseIsDepressed: false,
            blockNewClick: false
        }
    }

    componentWillUpdate(nextProps: MicrophoneButtonProps, nextState: MicrophoneButtonState) {
        if (nextState.mouseIsDepressed !== this.state.mouseIsDepressed) {
            this.handleClickUnclick(nextState.mouseIsDepressed, nextProps.speechState)
        }
    }

    handleClickUnclick = (mouseIsDepressed: boolean, speechState: SpeechStateType): void => {
        if (speechState === Thinking) return
        if (mouseIsDepressed) {
            this.props.handleClicked()
        } else {
            this.props.handleUnclicked()
        }
    }

    handleMouseUp = (): void => {
        setTimeout(() => this.setState({ blockNewClick: false }), 200)
        if (this.state.mouseIsDepressed)
            this.setState({ blockNewClick: true, mouseIsDepressed: false })
    }

    handleMouseDown = (): void => {
        if (!this.state.mouseIsDepressed && !this.state.blockNewClick)
            this.setState({ mouseIsDepressed: true })
    }

    render() {

        const isActive = this.props.speechState !== Inactive

        return (
            <div className={`bct-microphoneButton ${isActive && 'bct-microphoneButton--active'}`}
                onMouseDown={this.handleMouseDown.bind(this)}
                onTouchStart={this.handleMouseDown.bind(this)}

                onMouseUp={this.handleMouseUp.bind(this)}
                onMouseOut={this.handleMouseUp.bind(this)}
                onTouchEnd={this.handleMouseUp.bind(this)}

                onContextMenu={(e) => e.preventDefault()}
            >
                <div className="bct-microphoneButton-stateText">
                    {isActive ? this.props.speechState : 'Inactive'}
                </div>
                <img
                    src={microphone}
                    alt="microphone"
                />
            </div>
        )
    }

}
