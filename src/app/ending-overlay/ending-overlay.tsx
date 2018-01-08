import * as React from 'react'
import { GameStateType } from '../common/types'

export interface EndingOverlayProps {
    gameState: GameStateType
}

const EndingOverlay: React.SFC<EndingOverlayProps> = (props: EndingOverlayProps) => {

    return (
        <div>
            <h1>
                {props.gameState}
            </h1>
        </div>
    )

}

export default EndingOverlay
