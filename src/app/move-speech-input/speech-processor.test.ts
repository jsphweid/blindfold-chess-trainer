import SpeechProcessor from './speech-processor'
import { ProcessingResponseStateType, ProcessingResponseType } from '../common/types'

describe('SpeechProcessor', () => {

    let speechProcessor: SpeechProcessor

    beforeEach(() => {
        speechProcessor = new SpeechProcessor('2n1r3/p1k2pp1/B1p3b1/P7/4NbP1/3PB3/1P2KP2/2R5 w - - 4 26')
    })

    afterEach(() => {
        speechProcessor = null
    })

    describe('getKeywords', () => {

        it('should find the correct positions in a string with basic positions', () => {
            expect(SpeechProcessor.getKeywords('A4 to b3')).toEqual(['a4', 'b3'])
        })

        it('should find two correct items although one is misinterpretted', () => {
            expect(SpeechProcessor.getKeywords('book goes to b4')).toEqual(['rook', 'b4'])
        })

        it('should pull first and last if more than 3 tokens in string', () => {
            expect(SpeechProcessor.getKeywords('rook goes to a4 and a5')).toEqual(['rook', 'a5'])
        })

        it('should find 1 correct position in a string with only 1 correct keyword', () => {
            expect(SpeechProcessor.getKeywords('A4 to b333')).toEqual(['a4'])
        })

        it('should find the correct keywords in a string', () => {
            expect(SpeechProcessor.getKeywords('rook goes to b4 lol')).toEqual(['rook', 'b4'])
        })

        it('should return empty array if there is no move there', () => {
            expect(SpeechProcessor.getKeywords('nothing here')).toEqual([])
        })

        it('should return array with rook, although the engine will later reject it because it is an invalid move', () => {
            expect(SpeechProcessor.getKeywords('rook to...')).toEqual(['rook'])
        })

    })

    describe('getRawMove', () => {

        it('should return arr with b3 when b3', () => {
            expect(speechProcessor.getRawMove({ from: null, to: 'b3' })).toEqual({ from: 'b2', to: 'b3' })
        })

        it('should return arr with c3 and b5 when knight at c3 goes to b5', () => {
            expect(speechProcessor.getRawMove({ from: 'knight', to: 'c3' })).toEqual({ from: 'e4', to: 'c3' })
        })

        it('should return arr with a6 to b4 when bishop to b4', () => {
            expect(speechProcessor.getRawMove({ from: 'bishop', to: 'b4' })).toEqual(null)
        })

        it('should return arr with e3 to d4 when bishop to d4', () => {
            expect(speechProcessor.getRawMove({ from: 'bishop', to: 'd4' })).toEqual({ from: 'e3', to: 'd4' })
        })

        it('should return arr with a6 to b5 when bishop to b5', () => {
            expect(speechProcessor.getRawMove({ from: 'bishop', to: 'b5' })).toEqual({ from: 'a6', to: 'b5' })
        })

        it('should return arr with c1 to h1 when rook to h1', () => {
            expect(speechProcessor.getRawMove({ from: 'rook', to: 'h1' })).toEqual({ from: 'c1', to: 'h1' })
        })

        it('should return arr with c1 to h1 when c1 to h1', () => {
            expect(speechProcessor.getRawMove({ from: 'c1', to: 'h1' })).toEqual({ from: 'c1', to: 'h1' })
        })

    })

    describe('determineStartingSquare', () => {

        it('should determine proper starting square if it is already a square', () => {
            expect(speechProcessor.determineStartingSquare({ from: 'a3', to: 'a4' })).toBe('a3')
        })

        it('should determine proper starting square if rook is only rook at c1', () => {
            expect(speechProcessor.determineStartingSquare({ from: 'rook', to: 'a1' })).toBe('c1')
        })

        it('should determine proper starting square as null if it doesnt exist', () => {
            expect(speechProcessor.determineStartingSquare({ from: 'queen', to: 'a1' })).toBe(null)
        })

        it('should determine proper starting square as a6 when trying to move bishop to b5', () => {
            expect(speechProcessor.determineStartingSquare({ from: 'bishop', to: 'b5' })).toBe('a6')
        })

        it('should determine proper starting square as e3 when trying to move bishop to b6', () => {
            expect(speechProcessor.determineStartingSquare({ from: 'bishop', to: 'b6' })).toBe('e3')
        })

        it('should determine proper starting square as null when trying to move bishop to unreachable spot', () => {
            expect(speechProcessor.determineStartingSquare({ from: 'bishop', to: 'h8' })).toBe(null)
        })

    })

    describe('findAllSquaresPieceIsOn', () => {

        it('should find the one square the white rook is on', () => {
            expect(speechProcessor.findAllSquaresPieceIsOn('rook')).toEqual(['c1'])
        })

        it('should find the one square the king is on', () => {
            expect(speechProcessor.findAllSquaresPieceIsOn('king')).toEqual(['e2'])
        })

        it('should find the two squares the bishops are on', () => {
            expect(speechProcessor.findAllSquaresPieceIsOn('bishop')).toEqual(['a6', 'e3'])
        })

        it('should find the four squares the pawns are on', () => {
            expect(speechProcessor.findAllSquaresPieceIsOn('pawn')).toEqual(['a5', 'b2', 'd3', 'f2', 'g4'])
        })

    })

    describe('addRowValues', () => {

        it('row values should add to 4 when all letters', () => {
            expect(SpeechProcessor.addRowValues('abcd')).toBe(4)
        })

        it('row values should add to 6 when all numbers', () => {
            expect(SpeechProcessor.addRowValues('222')).toBe(6)
        })

        it('row values should add to 6 when combo of letters and numbers', () => {
            expect(SpeechProcessor.addRowValues('2lol1')).toBe(6)
        })

    })

    describe('computerGuess', () => {

        it('should derive the correct guess when a few results are fed in, one with two -- prefers result with 2 over 1', () => {
            const rawResults = ['random stuff', 'h2', 'C1 goes to c3', 'a-3 goes to a-4', 'more random stuff with ending h2']
            const expectedResults: ProcessingResponseType = {
                responseType: ProcessingResponseStateType.Successful,
                refinedMove: { descriptiveMove: 'rook moves to c3?', rawMove: 'c1c3' }
            }
            expect(speechProcessor.computerGuess(rawResults)).toEqual(expectedResults)
        })

        it('should derive the correct guess when pawn is the piece with the shorthand', () => {
            const rawResults = ['random stuff', 'B4 goes to zzz', 'h20', 'a-3 goes to a-4', 'more random stuff with ending']
            const expectedResults: ProcessingResponseType = {
                responseType: ProcessingResponseStateType.Successful,
                refinedMove: { descriptiveMove: 'pawn moves to b4?', rawMove: 'b2b4' }
            }
            expect(speechProcessor.computerGuess(rawResults)).toEqual(expectedResults)
        })

        it('should derive the correct guess when bishop takes a knight', () => {
            const rawResults = ['random stuff', 'bishop takes knight at c8', 'h20', 'a-3 goes to a-4', 'more random stuff with ending']
            const expectedResults: ProcessingResponseType = {
                responseType: ProcessingResponseStateType.Successful,
                refinedMove: { descriptiveMove: 'bishop takes knight at c8?', rawMove: 'a6c8' }
            }
            expect(speechProcessor.computerGuess(rawResults)).toEqual(expectedResults)
        })

        it('should come up with invalid asking for invalid move', () => {
            const rawResults = ['random stuff', 'bishop takes pawn at c6', 'h20', 'a-3 goes to a-4', 'more random stuff with ending']
            const expectedResults: ProcessingResponseType = {
                responseType: ProcessingResponseStateType.Invalid,
                refinedMove: null
            }
            expect(speechProcessor.computerGuess(rawResults)).toEqual(expectedResults)
        })

        it('should come up with incomprehensible when it cant make sense out of any of the results', () => {
            const rawResults = ['random stuff', 'bishop takes nothing!', 'h20', 'a-3 goes to a-4', 'more random stuff with ending']
            const expectedResults: ProcessingResponseType = {
                responseType: ProcessingResponseStateType.Incomprehensible,
                refinedMove: null
            }
            expect(speechProcessor.computerGuess(rawResults)).toEqual(expectedResults)
        })

    })

})
