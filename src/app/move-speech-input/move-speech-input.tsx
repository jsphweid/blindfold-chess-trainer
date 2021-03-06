import * as React from 'react'
import { ProcessingResponseStateType, ProcessingResponseType, SpeechStateType } from '../common/types'
import SpeechProcessor from './speech-processor'
import MicrophoneButton from './microphone-button'

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
    utterances: SpeechSynthesisUtterance[] = [] // because of a bug with the api
    speechSynthJustStarted: boolean = false // because of a bug with the api

    constructor(props: MoveSpeechInputProps) {
        super(props)

        this.state = {
            speechRecognitionSupportedAndOperational: null,
            info: '',
            confirmMessage: '',
            speechEvents: [],
            confirmingMove: null,
            safetySpacebarIsPressed: false,
            speechState: Inactive
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
        if (nextState.info && (this.state.info !== nextState.info)) {
            this.speak(nextState.info)
        }
        if (nextProps.blackMoveMessage && (this.props.blackMoveMessage !== nextProps.blackMoveMessage)) {
            this.speak(nextProps.blackMoveMessage)
        }
    }

    initializeSpeechSynth = (): void => {
        this.speechSynth = window.speechSynthesis
    }

    speak = (text: string): void => {
        if (!this.speechSynth || this.speechSynthJustStarted) return null
        this.setState({ speechState: Speaking })        
        const msg: SpeechSynthesisUtterance = new SpeechSynthesisUtterance()
        msg.text = text
        msg.volume = 1
        msg.rate = 1
        msg.pitch = 1
        msg.voice = speechSynthesis.getVoices().filter((voice) => voice.name === 'Google UK English Female')[0]
        msg.onend = () => {
            if (!this.speechSynthJustStarted) {
                this.utterances = []
                this.setState({ speechState: Inactive })
            }
        }
        this.speechSynthJustStarted = true
        setTimeout(() => this.speechSynthJustStarted = false, 500)
        this.utterances.push(msg)
        this.speechSynth.speak(msg)
    }

    initializeSpeechRecognizer = (): void => {
        this.speechRecognizer.continuous = true
        this.speechRecognizer.interimResults = true
        this.speechRecognizer.lang = 'en-US'
        this.speechRecognizer.maxAlternatives = 10
        this.speechRecognizer.onresult = this.handleEventStream
        this.speechRecognizer.onstart = (): void => this.setState({ speechState: Listening, speechEvents: [], info: '' })
        this.speechRecognizer.onend = (): void => {
            this.setState({ speechState: Thinking })
            this.processSpeechEvents()
        }
    }

    processSpeechEvents = (): void => {
        const topResults: string[] = SpeechProcessor.reformulateSpeechEvents(this.state.speechEvents).final
        const speechProcessor: SpeechProcessor = new SpeechProcessor(this.props.gameState)
        const guess: ProcessingResponseType = speechProcessor.computerGuess(topResults)
        switch (guess.responseType) {
            default:
            case ProcessingResponseStateType.Incomprehensible:
                this.setState({ info: ProcessingResponseStateType.Incomprehensible })
                break
            case ProcessingResponseStateType.Invalid:
                this.setState({ info: ProcessingResponseStateType.Invalid })
                break
            case ProcessingResponseStateType.Successful:
                this.props.handleMoveSubmit(guess.refinedMove.rawMove)
                this.setState({ info: guess.refinedMove.descriptiveMove, confirmingMove: guess.refinedMove.rawMove })
                break
        }
    }

    initializeSpacebarHandler = (): void => {
        document.addEventListener('keydown', (keyEvent: KeyboardEvent) => {
            if (keyEvent.code === 'Space') keyEvent.preventDefault()
            if (keyEvent.code === 'Space' && this.state.speechState !== Listening && !this.state.safetySpacebarIsPressed) {
                this.setState({ safetySpacebarIsPressed: true })                
                this.handleSpeechRecognizerStart()
            }
        })
        document.addEventListener('keyup', (keyEvent: KeyboardEvent) => {
            if (keyEvent.code === 'Space') keyEvent.preventDefault()
            if (keyEvent.code === 'Space') {
                this.setState({ safetySpacebarIsPressed: false })                
                this.handleSpeechRecognizerStop()
            }
        })
    }

    handleSpeechRecognizerStart = (): void => {
        this.props.resetWaitingToConfirm()
        this.speechSynth.cancel()
        this.speechRecognizer.start()
    }

    handleSpeechRecognizerStop = (): void => {
        this.speechRecognizer.stop()
        setTimeout(() => { // if something goes wrong, just reset
            if (this.state.speechState === Thinking) {
                this.handleReset()
            }
        }, 500)
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
        this.speechSynth.cancel()
        this.speechRecognizer.stop()
        this.setState({
            info: '',
            confirmMessage: '',
            speechEvents: [],
            confirmingMove: null,
            speechState: Inactive
        })
    }

    handleConfirmMove = (confirmingMove: string = this.state.confirmingMove): void => {
        if (this.props.moveErrorMessage) {
            this.setState({ info: this.props.moveErrorMessage, confirmingMove: null })
        } else {
            this.props.handleMoveSubmit(confirmingMove)
            this.handleReset()
        }
    }

    renderSpeechRecognitionStatus = (): JSX.Element => {
        switch (this.state.speechRecognitionSupportedAndOperational) {
            default:
            case false:
                return <div>Unfortunately Web Speech is not supported in this browser...</div>
            case null:
                return <div>Attempting to load Web Speech...</div>
            case true:
                return null
        }
    }

    render() {
        return (
            <div className="bct-moveSpeechInput">
               <MicrophoneButton
                    handleClicked={this.handleSpeechRecognizerStart}
                    handleUnclicked={this.handleSpeechRecognizerStop}
                    speechState={this.state.speechState}
                />
                {this.state.confirmingMove ? <button onClick={() => this.handleConfirmMove()}>Confirm Move</button> : null}
                <div className="bct-moveSpeechInput-titleAndSwitch">
                    <h2>Practice Using Speech</h2>
                    <button onClick={this.props.handleToggleSpeechInput}>Switch to Text Input</button>
                </div>
                <p><strong>Hold Spacebar (or click and hold on icon) and speak your move.</strong></p>
                {this.renderSpeechRecognitionStatus()}
            </div>
        )
    }

}
