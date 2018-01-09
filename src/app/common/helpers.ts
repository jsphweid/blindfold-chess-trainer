import { NotationType, PositionType } from './generatedTypes'
import { ReformulatedSpeechResultType, FoundPositionType, ChessJSMoveDetailType } from './types'
import { positions } from './constants'

export const getCharAsNumber = (char: string): number => parseInt(char, 10)
export const charIsNumber = (char: string): boolean => !!parseInt(char, 10)

export const getReactChessStateFromFen = (fen: string): NotationType[] => {
    const positionPortionOfFen: string = fen.split(' ')[0]
    const rows: string[] = positionPortionOfFen.split('/')
    const ret: NotationType[] = []    
    rows.forEach((row: string, index: number) => {
        const letters: string[] = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
        const rowNumTranslated: number = 8 - index
        let indexWithinRow: number = 0
        const rowAsCharArray: string[] = row.split('')
        rowAsCharArray.forEach((char: string) => {
            if (charIsNumber(char)) {
                indexWithinRow += getCharAsNumber(char)
            } else {
                ret.push(`${char}@${letters[indexWithinRow]}${rowNumTranslated}` as NotationType)
                indexWithinRow++
            }
        })
        
    })
    return ret
}

// TODO: if training a model some day, get the confidences from each result along with
// the transcript to predict based on pure text

export const reformulateSpeechEvents = (results: SpeechRecognitionResult[]): ReformulatedSpeechResultType => {
    const reformulated: ReformulatedSpeechResultType = { final: [], temps: [] }
    results.forEach((result: SpeechRecognitionResult) => {
        for (let i = 0; i < result.length; i++) {
            const transcript: string = result[i].transcript
            const bucket = result.isFinal ? 'final' : 'temps'
            reformulated[bucket].push(transcript)
        }
    })
    return reformulated
}

export const computerMVPGuess = (rawResults: string[]): string => {
    let ret: string = null
    rawResults.forEach((result: string) => {
        const foundPositions = [] as FoundPositionType[]
        positions.forEach((position: PositionType) => {
            const indexOfFirstLetter: number = result.indexOf(position)
            if (indexOfFirstLetter !== -1) foundPositions.push({ indexOfFirstLetter, position })
        })
        if (foundPositions.length === 2) {
            foundPositions.sort((a, b) => a.indexOfFirstLetter - b.indexOfFirstLetter)
            ret = foundPositions.map((foundPosition: FoundPositionType) => foundPosition.position).join('')
        }
    })
    return ret
}

export const generateConfirmMessage = (move: string): string => {
    return `${move.slice(0, 2)} goes to ${move.slice(2, 4)}?`
}

export const generateBlackMoveMessage = (moveDetail: ChessJSMoveDetailType): string => {
    return `Black moves from ${moveDetail.from} to ${moveDetail.to}.`
}
