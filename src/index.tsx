import * as React from 'react'
import * as ReactDOM from 'react-dom'
import BlindfoldChessTrainer from './app/blindfold-chess-trainer'

import './styles.scss'

ReactDOM.render(
    <BlindfoldChessTrainer />,
    document.getElementById('app')
)

if (module.hot) module.hot.accept()
