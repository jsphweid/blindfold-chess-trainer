import { NotationType, PositionType } from './generatedTypes'
import {
    ReformulatedSpeechResultType, FoundPositionType, ChessJSMoveDetailType, KeyWordType,
    ValidPieceOrPositionType
} from './types'
import { validPositionsAndPieces } from './constants'

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

const tryToFindKeyWords = (str: string): KeyWordType[] => {
    const lowerCasedResult: string = str.toLowerCase()
    const keyWords: KeyWordType[] = []
    validPositionsAndPieces.forEach((position: PositionType) => {
        const indexOfFirstLetter: number = lowerCasedResult.indexOf(position)
        if (indexOfFirstLetter !== -1) keyWords.push({ indexOfFirstLetter, position })
    })
    return keyWords
}

const convertCloseWords = (word: string): ValidPieceOrPositionType => {

}

export const computerMVPGuess = (rawResults: string[]): string => {
    let ret: string = null
    rawResults.forEach((result: string) => {

        const keyWords: KeyWordType[] = tryToFindKeyWords(result)
        switch (keyWords.length) {
            default:
            case 1:
                break // temp, handle pawn movements...
            case 2:
                keyWords.sort((a, b) => a.indexOfFirstLetter - b.indexOfFirstLetter)
                const cleanedWords =
                ret = keyWords.map((foundPosition: FoundPositionType) => foundPosition.position).join('')
                break
            case 0:
                break
        }

    })
    return ret
}

///////////////// LEGACY
// export const computerMVPGuess = (rawResults: string[]): string => {
//     let ret: string = null
//     rawResults.forEach((result: string) => {
//         const foundPositions = [] as FoundPositionType[]
//         positions.forEach((position: PositionType) => {
//             const indexOfFirstLetter: number = result.indexOf(position)
//             if (indexOfFirstLetter !== -1) foundPositions.push({ indexOfFirstLetter, position })
//         })
//         if (foundPositions.length === 2) {
//             foundPositions.sort((a, b) => a.indexOfFirstLetter - b.indexOfFirstLetter)
//             ret = foundPositions.map((foundPosition: FoundPositionType) => foundPosition.position).join('')
//         }
//     })
//     return ret
// }

export const generateConfirmMessage = (move: string): string => {
    return `${move.slice(0, 2)} goes to ${move.slice(2, 4)}?`
}

export const generateBlackMoveMessage = (moveDetail: ChessJSMoveDetailType): string => {
    return `Black moves from ${moveDetail.from} to ${moveDetail.to}.`
}
