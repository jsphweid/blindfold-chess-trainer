import * as React from 'react'
import { reformulateSpeechEvents, computerMVPGuess, generateConfirmMessage } from '../common/helpers'
import { SpeechStateType } from '../common/types'
import InteractiveComputerModal from './interactive-computer-modal'
const { Listening, Speaking, Thinking, Inactive } = SpeechStateType

export interface MoveSpeechInputProps {
    handleMoveSubmit: (move: string) => void
}

export interface MoveSpeechInputState {
    speechRecognitionSupportedAndOperational: boolean
    info: string
    confirmMessage: string
    speechEvents: SpeechRecognitionResult[]
    confirmingMove: string
    speechState: SpeechStateType
}

export default class MoveSpeechInput extends React.Component<MoveSpeechInputProps, MoveSpeechInputState> {

    speechRecognizer: SpeechRecognition

    constructor(props: MoveSpeechInputProps) {
        super(props)

        this.state = {
            speechRecognitionSupportedAndOperational: null,
            info: '',
            confirmMessage: '',
            speechEvents: [],
            confirmingMove: null,
            speechState: Inactive
        }
    }

    componentDidMount() {
        if (!('webkitSpeechRecognition' in window)) {
            this.setState({ speechRecognitionSupportedAndOperational: false })
        } else {
            this.speechRecognizer = new webkitSpeechRecognition()
            this.setState({ speechRecognitionSupportedAndOperational: true })
            this.initializeSpeechRecognizer()
            this.initializeSpacebarHandler()
        }
    }

    initializeSpeechRecognizer = (): void => {
        this.speechRecognizer.continuous = true
        this.speechRecognizer.interimResults = true
        this.speechRecognizer.lang = 'en-US'
        this.speechRecognizer.maxAlternatives = 10
        this.speechRecognizer.onresult = this.handleEventStream
        this.speechRecognizer.onstart = (): void => this.setState({ speechEvents: [], info: '', speechState: Listening  })
        this.speechRecognizer.onend = this.processSpeechEvents
    }

    processSpeechEvents = (): void => {
        const topResults: string[] = reformulateSpeechEvents(this.state.speechEvents).final
        const easyGuess: string = computerMVPGuess(topResults)
        if (easyGuess) {
            this.props.handleMoveSubmit(easyGuess.toLowerCase())
            this.setState({ speechState: Speaking, info: generateConfirmMessage(easyGuess), confirmingMove: easyGuess })
        } else {
            this.setState({ speechState: Speaking, info: `I'm sorry. I did not understand. Try again.` })
        }
    }

    initializeSpacebarHandler = (): void => {
        document.addEventListener('keydown', (keyEvent: KeyboardEvent) => {
            if (keyEvent.code === 'Space' && this.state.speechState !== Listening) {
                this.speechRecognizer.start()
            }
        })
        document.addEventListener('keyup', (keyEvent: KeyboardEvent) => {
            if (keyEvent.code === 'Space') {
                this.setState({ speechState: Thinking })
                this.speechRecognizer.stop()
            }
        })
    }

    handleEventStream = (event: SpeechRecognitionEvent): void => {
        if (typeof(event.results) === 'undefined') {
            this.setState({ info: 'No idea what you just said.' })
            this.speechRecognizer.stop()
            return
        }

        for (let i = event.resultIndex; i < event.results.length; ++i) {
            const speechEventsClone: SpeechRecognitionResult[] = this.state.speechEvents.slice()
            speechEventsClone.push(event.results[i])
            this.setState({ speechEvents: speechEventsClone })
        }
    }

    handleReset = (): void => {
        this.setState({
            speechState: SpeechStateType.Inactive,
            info: '',
            confirmMessage: '',
            speechEvents: [],
            confirmingMove: null
        })
    }

    handleConfirmMove = (confirmingMove: string): void => {
        this.props.handleMoveSubmit(confirmingMove.toLowerCase())
        this.handleReset()
    }

    renderInteractiveComputerModal = (): JSX.Element => {
        const { speechState, confirmingMove, info } = this.state

        return (
            <InteractiveComputerModal
                speechState={speechState}
                confirmingMove={confirmingMove}
                info={info}
                handleEscape={this.handleReset}
                handleConfirmMove={this.handleConfirmMove.bind(this, confirmingMove)}
            />
        )
    }

    renderSpeechRecognitionContent = (): JSX.Element => {
        const { speechState, speechRecognitionSupportedAndOperational } = this.state
        switch (speechRecognitionSupportedAndOperational) {
            default:
            case null:
                return <div>Attempting to load Web Speech...</div>
            case false:
                return <div>Unfortunately Web Speech is not supported in this browser...</div>
            case true:
                return (
                    <div>
                        {speechState !== SpeechStateType.Inactive ? this.renderInteractiveComputerModal() : null}
                    </div>
                )
        }
    }

    render() {
        return (
            <div className="bct-moveSpeechInput">
                <h2>Practice Using Speech</h2>
                <p>
                    Press Spacebar so the computer can listen. For now, it can only
                    understand this basic yet explicit notation -- "a3 takes a4" or 
                    "a3 moves to a4".
                </p>
                {this.renderSpeechRecognitionContent()}
            </div>
        )
    }

}
