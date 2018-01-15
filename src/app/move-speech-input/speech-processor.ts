import {
    MoveType, PieceLetterType, PieceType, ProcessingResponseStateType, ProcessingResponseType,
    ReformulatedSpeechResultType, SemiValidPieceOrPositionType, ValidPieceOrPositionType
} from '../common/types'
import ChessPlayground from '../chess-engine/chess-playground'
import { PositionType } from '../common/generatedTypes'
import {
    kingSideCastleMoveStr, objWithPiecesAndCloseMatches, pieces,
    queenSideCastleMoveStr
} from '../common/constants'
import { getPieceLetter, isPiece, isPosition, findPieceLoosely } from '../common/helpers'

export default class SpeechProcessor {

    private playground: ChessPlayground
    private fen: string

    constructor(fen: string) {
        this.fen = fen
        this.playground = new ChessPlayground()
    }

    static determineIfCastlingMove(guesses: string[]): boolean {
        return guesses.join(' ').split(' ').some((guess) => guess.toLowerCase() === 'castle')
    }

    static determineIfPawnPromoting(guesses: string[]): boolean {
        return guesses.join(' ').split(' ').some((guess) => guess.includes('promo'))
    }

    static reformulateSpeechEvents(results: SpeechRecognitionResult[]): ReformulatedSpeechResultType {
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

    static getKeywords(str: string): ValidPieceOrPositionType[] {
        const tokenizedResults: string[] = str.toLowerCase().split(' ')

        return tokenizedResults
            .map((token: string) => (isPosition(token)) ? token : findPieceLoosely(token))
            .filter(Boolean)
            .filter((item, i, arr) => i === 0 || i === (arr.length - 1)) as ValidPieceOrPositionType[]
    }

    static addRowValues(str: string): number {
        let sum: number = 0
        for (const char of str) {
            const intParsed = parseInt(char, 10)
            if (intParsed)
                sum += intParsed
            else
                sum ++
        }
        return sum
    }

    findAllSquaresPieceIsOn(piece: PieceType): PositionType[] {
        const pieceLetter: PieceLetterType = getPieceLetter(piece)
        const splitGameState: string[] = this.fen.split(' ')[0].split('/')
        const positions = [] as PositionType[]
        splitGameState.forEach((row: string, rowNumber: number) => {
            for (let i = 0; i < row.length; i++) {
                if (pieceLetter === row[i]) {
                    // break out and simplify into one function
                    const xPosition: string = 'abcdefgh'[SpeechProcessor.addRowValues(row.slice(0, i))]
                    const yPosition: number = 8 - rowNumber
                    positions.push(`${xPosition}${yPosition}` as PositionType)
                }
            }
        })
        return positions.sort()
    }

    determineStartingSquare(move: MoveType): PositionType {
        if (isPosition(move.from))
            return move.from as PositionType

        const matchingSquares = this.findAllSquaresPieceIsOn(move.from as PieceType)

        switch (true) {
            default:
            case matchingSquares.length === 0:
                return null
            case matchingSquares.length === 1:
                return matchingSquares[0]
            case matchingSquares.length >= 2:
                return this.playground.determineWhichSquareIsValidMove(matchingSquares, move.to as PositionType, this.fen) // assumes second one is position
        }
    }

    getRawMove(move: MoveType): MoveType {
        const startingSquare: PositionType = move.from
            ? this.determineStartingSquare(move)
            : this.playground.determinePawnStartingSquare(move.to, this.fen)

        return startingSquare ? { from: startingSquare, to: move.to } : null
    }

    handleCastlingMove(rawResults: string[]): ProcessingResponseType {
        const flattenedResults: string[] = rawResults.join(' ').split(' ')
        const queen = flattenedResults.some((guess) => guess.toLowerCase() === 'queen')
        const king = flattenedResults.some((guess) => guess.toLowerCase() === 'king')

        if ((queen && king) || (!queen && !king))
            return { responseType: ProcessingResponseStateType.Incomprehensible, refinedMove: null }

        if (king && this.playground.moveIsValid(kingSideCastleMoveStr, this.fen)) {
            return {
                responseType: ProcessingResponseStateType.Successful,
                refinedMove: { descriptiveMove: 'king side castle?', rawMove: kingSideCastleMoveStr }
            }
        }

        if (queen && this.playground.moveIsValid(queenSideCastleMoveStr, this.fen)) {
            return {
                responseType: ProcessingResponseStateType.Successful,
                refinedMove: { descriptiveMove: 'queen side castle?', rawMove: queenSideCastleMoveStr }
            }
        }

        return { responseType: ProcessingResponseStateType.Invalid, refinedMove: null }
    }

    handlePawnPromotion(rawResults: string[]): ProcessingResponseType {
        const flattenedResults: string[] = rawResults.join(' ').split(' ')
        const promoteToPiece: PieceType = flattenedResults
            .map((token: string) => findPieceLoosely(token))
            .filter((token: string) => !objWithPiecesAndCloseMatches['pawn'].includes(token))
            .filter(Boolean)
            .filter((item, i, arr) => i === arr.length - 1)[0]

        if (!promoteToPiece)
            return { responseType: ProcessingResponseStateType.Incomprehensible, refinedMove: null }
        const pawnsOnSeven: PositionType[] = this.findAllSquaresPieceIsOn('pawn')
            .filter((square: PositionType) => square[1] === '7')

        const toPosition: PositionType = flattenedResults
                .filter((token: string) => isPosition(token))[0] as PositionType
                ||
                `${pawnsOnSeven[0][0]}8` as PositionType

        const fromPosition = this.playground.getWhichPawnCanCastleThere(pawnsOnSeven, toPosition, this.fen)

        if (!toPosition || !fromPosition || !pawnsOnSeven)
            return { responseType: ProcessingResponseStateType.Invalid, refinedMove: null }

        return {
            responseType: ProcessingResponseStateType.Successful,
            refinedMove: {
                descriptiveMove: `pawn promotes to ${promoteToPiece} at ${toPosition}?`,
                rawMove: `${fromPosition}${toPosition}=${getPieceLetter(promoteToPiece)}`
            }
        }

    }

    computerGuess(rawResults: string[]): ProcessingResponseType {
        if (SpeechProcessor.determineIfCastlingMove(rawResults))
            return this.handleCastlingMove(rawResults)
        
        if (SpeechProcessor.determineIfPawnPromoting(rawResults))
            return this.handlePawnPromotion(rawResults)

        const bestGuess: SemiValidPieceOrPositionType[] = rawResults
            .map((result: string) => SpeechProcessor.getKeywords(result))
            .filter((semiValidPositions: SemiValidPieceOrPositionType[]) => semiValidPositions.length > 0)
            .filter((semiValidPositions: SemiValidPieceOrPositionType[]) => !(semiValidPositions.length === 1 && isPiece(semiValidPositions[0])))
            .sort((a, b) => b.length - a.length)
            [0]

        if (!bestGuess)
            return { responseType: ProcessingResponseStateType.Incomprehensible, refinedMove: null }

        const cleanedMove: MoveType = bestGuess.length === 2
            ? { from: bestGuess[0], to: bestGuess[1] as PositionType }
            : { from: null, to: bestGuess[0] as PositionType }

        const rawMove: MoveType = this.getRawMove(cleanedMove)

        if (!rawMove)
            return { responseType: ProcessingResponseStateType.Invalid, refinedMove: null }

        const descriptiveMove: string = this.playground.getDescriptiveMove(rawMove, this.fen)

        return { responseType: ProcessingResponseStateType.Successful, refinedMove: { descriptiveMove, rawMove: `${rawMove.from}${rawMove.to}` } }
    }

}
