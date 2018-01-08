import * as React from 'react'

export interface MoveSpeechInputProps {
}

export interface MoveSpeechInputState {
}

export default class MoveSpeechInput extends React.Component<MoveSpeechInputProps, MoveSpeechInputState> {

    constructor(props: MoveSpeechInputProps) {
        super(props)

        this.state = {
        }
    }

    render() {
        return (
            <div className="bct-moveSpeechInput">
                <h2>Practice Using Speech</h2>
            </div>
        )
    }

}
