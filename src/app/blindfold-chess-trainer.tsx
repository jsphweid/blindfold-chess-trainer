import * as React from 'react'

export interface BlindfoldChessTrainerProps {
}

export default class BlindfoldChessTrainer extends React.Component<BlindfoldChessTrainerProps> {


    constructor(props: BlindfoldChessTrainerProps) {

        super(props)

    }



    render() {

        return (
            <div className="bct">
                Blindfold Chess Trainer
            </div>
        )

    }

}
