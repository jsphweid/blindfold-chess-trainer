import * as React from 'react'
import { ProcessingResponseStateType, ProcessingResponseType, SpeechStateType } from '../common/types'
import InteractiveComputerModal from './interactive-computer-modal'
import SpeechProcessor from './speech-processor'
const { Listening, Speaking, Thinking, Inactive } = SpeechStateType

export interface MoveSpeechInputProps {
    handleMoveSubmit: (move: string) => void
    resetWaitingToConfirm: () => void
    moveErrorMessage: string
    blackMoveMessage: string
    gameState: string
    handleToggleSpeechInput: () => void
}

export interface MoveSpeechInputState {
    speechRecognitionSupportedAndOperational: boolean
    info: string
    confirmMessage: string
    speechEvents: SpeechRecognitionResult[]
    confirmingMove: string
    speechState: SpeechStateType
    safetySpacebarIsPressed: boolean
}

export default class MoveSpeechInput extends React.Component<MoveSpeechInputProps, MoveSpeechInputState> {

    speechRecognizer: SpeechRecognition
    speechSynth: SpeechSynthesis

    constructor(props: MoveSpeechInputProps) {
        super(props)

        this.state = {
            speechRecognitionSupportedAndOperational: null,
            info: '',
            confirmMessage: '',
            speechEvents: [],
            confirmingMove: null,
            speechState: Inactive,
            safetySpacebarIsPressed: false
        }
    }

    browserIsSupported = (): boolean => 'webkitSpeechRecognition' in window && 'speechSynthesis' in window

    componentDidMount() {
        if (!this.browserIsSupported) {
            this.setState({ speechRecognitionSupportedAndOperational: false })
        } else {
            this.speechRecognizer = new webkitSpeechRecognition()
            this.setState({ speechRecognitionSupportedAndOperational: true })
            this.initializeSpacebarHandler()
            this.initializeSpeechRecognizer()
            this.initializeSpeechSynth()
        }
    }

    componentWillUpdate(nextProps: MoveSpeechInputProps, nextState: MoveSpeechInputState) {
        if (this.state.info !== nextState.info) {
            this.speak(nextState.info)
        }
        if (this.props.blackMoveMessage !== nextProps.blackMoveMessage) {
            this.speak(nextProps.blackMoveMessage)
        }
    }

    initializeSpeechSynth = (): void => {
        this.speechSynth = window.speechSynthesis
    }

    speak = (text: string): void => {
        if (!this.speechSynth) return null
        const msg: SpeechSynthesisUtterance = new SpeechSynthesisUtterance()
        msg.text = text
        msg.volume = 1
        msg.rate = 1
        msg.pitch = 1
        msg.voice = speechSynthesis.getVoices().filter((voice) => voice.name === 'Google UK English Female')[0]
        this.speechSynth.speak(msg)
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
        const topResults: string[] = SpeechProcessor.reformulateSpeechEvents(this.state.speechEvents).final
        const speechProcessor: SpeechProcessor = new SpeechProcessor(this.props.gameState)
        const guess: ProcessingResponseType = speechProcessor.computerGuess(topResults)
        const speechState: SpeechStateType = Speaking
        switch (guess.responseType) {
            default:
            case ProcessingResponseStateType.Incomprehensible:
                this.setState({ speechState, info: ProcessingResponseStateType.Incomprehensible })
                break
            case ProcessingResponseStateType.Invalid:
                this.setState({ speechState, info: ProcessingResponseStateType.Invalid })
                break
            case ProcessingResponseStateType.Successful:
                this.props.handleMoveSubmit(guess.refinedMove.rawMove)
                this.setState({ speechState, info: guess.refinedMove.descriptiveMove, confirmingMove: guess.refinedMove.rawMove })
                break
        }
    }

    initializeSpacebarHandler = (): void => {
        document.addEventListener('keydown', (keyEvent: KeyboardEvent) => {
            if (keyEvent.code === 'Space') keyEvent.preventDefault()
            if (keyEvent.code === 'Space' && this.state.speechState !== Listening && !this.state.safetySpacebarIsPressed) {
                this.props.resetWaitingToConfirm()
                this.speechSynth.cancel()
                this.speechRecognizer.start()
                this.setState({ safetySpacebarIsPressed: true })
            }
        })
        document.addEventListener('keyup', (keyEvent: KeyboardEvent) => {
            if (keyEvent.code === 'Space') keyEvent.preventDefault()
            if (keyEvent.code === 'Space') {
                this.setState({ speechState: Thinking, safetySpacebarIsPressed: false })
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
        this.props.resetWaitingToConfirm()
        this.setState({
            speechState: SpeechStateType.Inactive,
            info: '',
            confirmMessage: '',
            speechEvents: [],
            confirmingMove: null
        })
    }

    handleConfirmMove = (confirmingMove: string): void => {
        if (this.props.moveErrorMessage) {
            this.setState({ info: this.props.moveErrorMessage, confirmingMove: null })
        } else {
            this.props.handleMoveSubmit(confirmingMove)
            this.handleReset()
        }
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
                <div className="bct-moveSpeechInput-titleAndSwitch">
                    <h2>Practice Using Speech</h2>
                    <button onClick={this.props.handleToggleSpeechInput}>Switch to Text Input</button>
                </div>
                <p><strong>Hold Spacebar and speak your move.</strong></p>
                {this.renderSpeechRecognitionContent()}
            </div>
        )
    }

}
