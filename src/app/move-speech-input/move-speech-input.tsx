import * as React from 'react'
import { SpeechResultType } from '../common/types'

export interface MoveSpeechInputProps {
}

export interface MoveSpeechInputState {
    speechRecognitionSupportedAndOperational: boolean
    info: string
    speechEvents: SpeechRecognitionResult[]
    listening: boolean
    processing: boolean
}

export default class MoveSpeechInput extends React.Component<MoveSpeechInputProps, MoveSpeechInputState> {

    speechRecognizer: SpeechRecognition

    constructor(props: MoveSpeechInputProps) {
        super(props)

        this.state = {
            speechRecognitionSupportedAndOperational: null,
            info: '',
            speechEvents: [],
            listening: false,
            processing: false
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
        this.speechRecognizer.onstart = (): void => this.setState({ speechEvents: [], info: '', listening: true  })
        this.speechRecognizer.onend = this.processSpeechEvents
    }

    processSpeechEvents = (): void => {
        this.setState({ listening: false, processing: true })
    }

    initializeSpacebarHandler = (): void => {

        document.addEventListener('keydown', (keyEvent: KeyboardEvent) => {
            if (keyEvent.code === 'Space' && !this.state.listening && this.state.speechEvents.length === 0) {
                this.speechRecognizer.start()
            }
        })
        document.addEventListener('keyup', (keyEvent: KeyboardEvent) => {
            if (keyEvent.code === 'Space') {
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
            if (event.results[i].isFinal) {
                // do something by iterating over results
            }
        }

    }

    renderSpeechRecognitionContent = (): JSX.Element => {

        switch (this.state.speechRecognitionSupportedAndOperational) {
            default:
            case null:
                return <div>Attempting to load Web Speech...</div>
            case false:
                return <div>Unfortunately Web Speech is not supported in this browser...</div>
            case true:
                return (
                    <div>
                        {this.state.listening ? <h3>listening...</h3> : null}
                        {this.state.processing ? <h3>processing...</h3> : null}
                    </div>
                )
        }

    }

    render() {
        return (
            <div className="bct-moveSpeechInput">
                <h2>Practice Using Speech</h2>
                {this.renderSpeechRecognitionContent()}
            </div>
        )
    }

}
