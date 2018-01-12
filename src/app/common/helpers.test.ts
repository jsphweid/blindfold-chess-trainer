import { NotationType } from './generatedTypes'
import {
    computerGuess, getReactChessStateFromFen, tryToFindKeyWords, getRawMove, determineStartingSquare,
    findAllSquaresPieceIsOn, addRowValues
} from './helpers'
import {
    determinePawnStartingSquare, determineWhichSquareIsValidMove,
    getDescriptiveMove
} from '../chess-engine/chess-validator'
import { ProcessingResponseStateType, ProcessingResponseType } from './types'

describe('Helpers', () => {

    beforeEach(() => {})

    afterEach(() => {})

    describe('getReactChessStateFromFen', () => {

        it('default in chess.js produces default in reactchess', () => {
            const defaultFen: string = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
            const reactChessDefaultLineup: NotationType[] = ['R@a1', 'P@a2', 'p@a7', 'r@a8', 'N@b1', 'P@b2', 'p@b7',
                'n@b8', 'B@c1', 'P@c2', 'p@c7', 'b@c8', 'Q@d1', 'P@d2', 'p@d7', 'q@d8', 'K@e1', 'P@e2','p@e7', 'k@e8',
                'B@f1', 'P@f2', 'p@f7', 'b@f8', 'N@g1', 'P@g2', 'p@g7', 'n@g8', 'R@h1', 'P@h2', 'p@h7', 'r@h8'
            ]
            expect(getReactChessStateFromFen(defaultFen).sort()).toEqual(reactChessDefaultLineup.sort())
        })

        it('bare bones fen should be bare bones reactchess', () => {
            const defaultFen: string = '4k3/4P3/4K3/8/8/8/8/8'
            const reactChessDefaultLineup: NotationType[] = ['k@e8', 'P@e7', 'K@e6']
            expect(getReactChessStateFromFen(defaultFen).sort()).toEqual(reactChessDefaultLineup.sort())
        })

        it('empty fen should be empty reactchess array', () => {
            const defaultFen: string = '8/8/8/8/8/8/8/8'
            const reactChessDefaultLineup: NotationType[] = []
            expect(getReactChessStateFromFen(defaultFen).sort()).toEqual(reactChessDefaultLineup.sort())
        })

        it('fen after a few moves checks out', () => {
            const defaultFen: string = 'rnbqkbnr/pppp1ppp/8/4p3/4PP2/8/PPPP2PP/RNBQKBNR'
            const reactChessDefaultLineup: NotationType[] = ['R@a1', 'P@a2', 'p@a7', 'r@a8', 'N@b1', 'P@b2', 'p@b7',
                'n@b8', 'B@c1', 'P@c2', 'p@c7', 'b@c8', 'Q@d1', 'P@d2', 'p@d7', 'q@d8', 'K@e1', 'P@e4','p@e5', 'k@e8',
                'B@f1', 'P@f4', 'p@f7', 'b@f8', 'N@g1', 'P@g2', 'p@g7', 'n@g8', 'R@h1', 'P@h2', 'p@h7', 'r@h8'
            ]
            expect(getReactChessStateFromFen(defaultFen).sort()).toEqual(reactChessDefaultLineup.sort())
        })

    })

    describe('tryToFindKeyWords', () => {

        it('should find the correct positions in a string with basic positions', () => {
            expect(tryToFindKeyWords('A4 to b3')).toEqual(['a4', 'b3'])
        })

        it('should find 1 correct position in a string with only 1 correct keyword', () => {
            expect(tryToFindKeyWords('A4 to b333')).toEqual(['a4'])
        })

        it('should find the correct keywords in a string', () => {
            expect(tryToFindKeyWords('rook goes to b4 lol')).toEqual(['rook', 'b4'])
        })

        it('should return empty array if there is no move there', () => {
            expect(tryToFindKeyWords('nothing here')).toEqual([])
        })

        it('should return array with rook, although the engine will later reject it because it is an invalid move', () => {
            expect(tryToFindKeyWords('rook to...')).toEqual(['rook'])
        })

    })

    describe('getRawMove', () => {

        const someFen: string = '2n1r3/p1k2pp1/B1p3b1/P7/4NbP1/4B3/1P2KP2/2R5 w - - 4 26'

        it('should return arr with b3 when b3', () => {
            expect(getRawMove({ from: null, to: 'b3' }, someFen)).toEqual({ from: 'b2', to: 'b3' })
        })

        it('should return arr with c3 and b5 when knight at c3 goes to b5', () => {
            expect(getRawMove({ from: 'knight', to: 'c3' }, someFen)).toEqual({ from: 'e4', to: 'c3' })
        })

        it('should return arr with a6 to b4 when bishop to b4', () => {
            expect(getRawMove({ from: 'bishop', to: 'b4' }, someFen)).toEqual(null)
        })

        it('should return arr with e3 to d4 when bishop to d4', () => {
            expect(getRawMove({ from: 'bishop', to: 'd4' }, someFen)).toEqual({ from: 'e3', to: 'd4' })
        })

        it('should return arr with a6 to b5 when bishop to b5', () => {
            expect(getRawMove({ from: 'bishop', to: 'b5' }, someFen)).toEqual({ from: 'a6', to: 'b5' })
        })

        it('should return arr with c1 to h1 when rook to h1', () => {
            expect(getRawMove({ from: 'rook', to: 'h1' }, someFen)).toEqual({ from: 'c1', to: 'h1' })
        })

        it('should return arr with c1 to h1 when c1 to h1', () => {
            expect(getRawMove({ from: 'c1', to: 'h1' }, someFen)).toEqual({ from: 'c1', to: 'h1' })
        })

    })

    describe('determinePawnStartingSquare', () => {

        const someFen: string = '2n1r3/p1k2pp1/B1p3b1/P7/4NbP1/3PB3/1P2KP2/2R5 w - - 4 26'

        it('should return b2 if you give it b4', () => {
            expect(determinePawnStartingSquare('b4', someFen)).toBe('b2')
        })

        it('should return f2 if you give it f3', () => {
            expect(determinePawnStartingSquare('b4', someFen)).toBe('b2')
        })

        it('should return null if you give it d3', () => {
            expect(determinePawnStartingSquare('d3', someFen)).toBe(null)
        })

        it('should return null if you give it d5 (because it cant move 2 after initial movement)', () => {
            expect(determinePawnStartingSquare('d5', someFen)).toBe(null)
        })

    })

    describe('determineWhichSquareIsValidMove', () => {

        const someFen: string = '2n1r3/p1k2pp1/B1p3b1/P7/4NbP1/4B3/1P2KP2/2R5 w - - 4 26'

        it('should determine a6 bishop when asking to disambiguate between the two: 1', () => {
            expect(determineWhichSquareIsValidMove(['a6', 'e3'], 'b5', someFen)).toBe('a6')
        })

        it('should determine a6 bishop when asking to disambiguate between the two: 2', () => {
            expect(determineWhichSquareIsValidMove(['a6', 'e3'], 'd3', someFen)).toBe('a6')
        })

        it('should determine e3 bishop when asking to disambiguate between the two: 1', () => {
            expect(determineWhichSquareIsValidMove(['a6', 'e3'], 'd4', someFen)).toBe('e3')
        })

        it('should determine e3 bishop when asking to disambiguate between the two: 2', () => {
            expect(determineWhichSquareIsValidMove(['a6', 'e3'], 'b6', someFen)).toBe('e3')
        })

        it('should determine null when asking to disambiguate between the two in an impossible circumstance', () => {
            expect(determineWhichSquareIsValidMove(['a6', 'e3'], 'h8', someFen)).toBe(null)
        })

    })

    describe('determineStartingSquare', () => {

        const someFen: string = '2n1r3/p1k2pp1/B1p3b1/P7/4NbP1/4B3/1P2KP2/2R5 w - - 4 26'

        it('should determine proper starting square if it is already a square', () => {
            expect(determineStartingSquare({ from: 'a3', to: 'a4' }, someFen)).toBe('a3')
        })

        it('should determine proper starting square if rook is only rook at c1', () => {
            expect(determineStartingSquare({ from: 'rook', to: 'a1' }, someFen)).toBe('c1')
        })

        it('should determine proper starting square as null if it doesnt exist', () => {
            expect(determineStartingSquare({ from: 'queen', to: 'a1' }, someFen)).toBe(null)
        })

        it('should determine proper starting square as a6 when trying to move bishop to b5', () => {
            expect(determineStartingSquare({ from: 'bishop', to: 'b5' }, someFen)).toBe('a6')
        })

        it('should determine proper starting square as e3 when trying to move bishop to b6', () => {
            expect(determineStartingSquare({ from: 'bishop', to: 'b6' }, someFen)).toBe('e3')
        })

        it('should determine proper starting square as null when trying to move bishop to unreachable spot', () => {
            expect(determineStartingSquare({ from: 'bishop', to: 'h8' }, someFen)).toBe(null)
        })

    })

    describe('findAllSquaresPieceIsOn', () => {

        const someFen: string = '2n1r3/p1k2pp1/B1p3b1/P7/4NbP1/4B3/1P2KP2/2R5 w - - 4 26'

        it('should find the one square the white rook is on', () => {
            expect(findAllSquaresPieceIsOn('rook', someFen)).toEqual(['c1'])
        })

        it('should find the one square the king is on', () => {
            expect(findAllSquaresPieceIsOn('king', someFen)).toEqual(['e2'])
        })

        it('should find the two squares the bishops are on', () => {
            expect(findAllSquaresPieceIsOn('bishop', someFen)).toEqual(['a6', 'e3'])
        })

        it('should find the four squares the pawns are on', () => {
            expect(findAllSquaresPieceIsOn('pawn', someFen)).toEqual(['a5', 'b2', 'f2', 'g4'])
        })

    })

    describe('addRowValues', () => {

        it('row values should add to 4 when all letters', () => {
            expect(addRowValues('abcd')).toBe(4)
        })

        it('row values should add to 6 when all numbers', () => {
            expect(addRowValues('222')).toBe(6)
        })

        it('row values should add to 6 when combo of letters and numbers', () => {
            expect(addRowValues('2lol1')).toBe(6)
        })

    })

    describe('getDescriptiveMove', () => {

        const someFen: string = '2n1r3/p1k2pp1/B1p3b1/P7/4NbP1/4B3/1P2KP2/2R5 w - - 4 26'

        it('should make "rook moves to c3?" if raw move is c1 to c3', () => {
            expect(getDescriptiveMove({ from: 'c1', to: 'c3' }, someFen)).toBe('rook moves to c3?')
        })

        it('should make "pawn moves to b4?" if raw move is null to b4', () => {
            expect(getDescriptiveMove({ from: null, to: 'b4' }, someFen)).toBe('pawn moves to b4?')
        })

        it('should make "bishop takes bishop at f4?" when raw move is e3 to f4', () => {
            expect(getDescriptiveMove({ from: 'e3', to: 'f4' }, someFen)).toBe('bishop takes bishop at f4?')
        })

        it('should make "bishop takes knight at c8?" when raw move is a6 to c8', () => {
            expect(getDescriptiveMove({ from: 'a6', to: 'c8' }, someFen)).toBe('bishop takes knight at c8?')
        })

    })

    describe('computerGuess', () => {

        const someFen: string = '2n1r3/p1k2pp1/B1p3b1/P7/4NbP1/4B3/1P2KP2/2R5 w - - 4 26'

        it('should derive the correct guess when a few results are fed in, one with two', () => {
            const rawResults = ['random stuff', 'C1 goes to c3', 'h2', 'a-3 goes to a-4', 'more random stuff with ending h2']
            const expectedResults: ProcessingResponseType = {
                responseType: ProcessingResponseStateType.Successful,
                refinedMove: { descriptiveMove: 'rook moves to c3?', rawMove: 'c1c3' }
            }
            expect(computerGuess(rawResults, someFen)).toEqual(expectedResults)
        })

        it('should derive the correct guess when pawn is the piece with the shorthand', () => {
            const rawResults = ['random stuff', 'B4 goes to zzz', 'h20', 'a-3 goes to a-4', 'more random stuff with ending']
            const expectedResults: ProcessingResponseType = {
                responseType: ProcessingResponseStateType.Successful,
                refinedMove: { descriptiveMove: 'pawn moves to b4?', rawMove: 'b2b4' }
            }
            expect(computerGuess(rawResults, someFen)).toEqual(expectedResults)
        })

        it('should derive the correct guess when bishop takes a knight', () => {
            const rawResults = ['random stuff', 'bishop takes knight at c8', 'h20', 'a-3 goes to a-4', 'more random stuff with ending']
            const expectedResults: ProcessingResponseType = {
                responseType: ProcessingResponseStateType.Successful,
                refinedMove: { descriptiveMove: 'bishop takes knight at c8?', rawMove: 'a6c8' }
            }
            expect(computerGuess(rawResults, someFen)).toEqual(expectedResults)
        })

        it('should come up with invalid asking for invalid move', () => {
            const rawResults = ['random stuff', 'bishop takes pawn at c6', 'h20', 'a-3 goes to a-4', 'more random stuff with ending']
            const expectedResults: ProcessingResponseType = {
                responseType: ProcessingResponseStateType.Invalid,
                refinedMove: null
            }
            expect(computerGuess(rawResults, someFen)).toEqual(expectedResults)
        })

        it('should come up with incomprehensible when it cant make sense out of any of the results', () => {
            const rawResults = ['random stuff', 'bishop takes nothing!', 'h20', 'a-3 goes to a-4', 'more random stuff with ending']
            const expectedResults: ProcessingResponseType = {
                responseType: ProcessingResponseStateType.Incomprehensible,
                refinedMove: null
            }
            expect(computerGuess(rawResults, someFen)).toEqual(expectedResults)
        })

    })

})
