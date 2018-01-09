import * as React from 'react'
import { SpeechStateType } from '../common/types'
const { Listening, Speaking, Thinking, Inactive } = SpeechStateType

export interface InteractiveComputerModalProps {
    speechState: SpeechStateType
    confirmingMove: string
    info: string
    handleConfirmMove: () => void
    handleEscape: () => void
}

export default class InteractiveComputerModal extends React.Component<InteractiveComputerModalProps> {

    constructor(props: InteractiveComputerModalProps) {
        super(props)
    }

    componentDidMount() {
        document.addEventListener('keydown', this.keydownEventListener)
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this.keydownEventListener)
    }

    keydownEventListener = (keyEvent: KeyboardEvent) => {
        const { handleEscape, confirmingMove, handleConfirmMove } = this.props
        if (keyEvent.code === 'Escape') handleEscape()
        if (keyEvent.code === 'Enter' && confirmingMove) handleConfirmMove()
    }

    render() {
        const { info, speechState, confirmingMove } = this.props
        return (
            <div className="bct-interactiveComputerModal">
                <div className="bct-interactiveComputerModal-content">
                    <h1>{this.props.speechState}</h1>
                    <p>{info}</p>
                    {confirmingMove ? <span>Please press enter to confirm your move, {confirmingMove}. Esc to cancel.</span> : null}
                </div>
            </div>
        )
    }

}
