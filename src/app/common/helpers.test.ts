import { NotationType } from './generatedTypes'
import { computerMVPGuess, getReactChessStateFromFen, tryToFindKeyWords, getRawMove, determineStartingSquare, findAllSquaresPieceIsOn, addRowValues } from './helpers'

describe('Audio File', () => {

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

        // it('should return arr with b3 when b3', () => {
        //     expect(getRawMove(['b3'], someFen)).toEqual(['b3'])
        // })
        
        // it('should return arr with c3 and b5 when knight at c3 goes to b5', () => {
        //     expect(getRawMove(['knight', 'c3'], someFen)).toEqual(['e4', 'c3'])
        // })

        // // needs to be deterministic>?!>?
        // it('should return arr with a6 to b4 when bishop to b4', () => {
        //     expect(getRawMove(['a6', 'b4'], someFen)).toEqual(['bishop', 'b4'])
        // })

        // it('should return arr with e3 to d4 when bishop to d4', () => {
        //     expect(getRawMove(['e3', 'd4'], someFen)).toEqual(['bishop', 'd4'])
        // })

        // it('should return arr with a6 to b5 when bishop to b5', () => {
        //     expect(getRawMove(['a6', 'b5'], someFen)).toEqual(['bishop', 'b5'])
        // })

        // it('should return arr with c1 to h1 when rook to h1', () => {
        //     expect(getRawMove(['c1', 'h1'], someFen)).toEqual(['rook', 'h1'])
        // })

    })

    describe('determineStartingSquare', () => {

        const someFen: string = '2n1r3/p1k2pp1/B1p3b1/P7/4NbP1/4B3/1P2KP2/2R5 w - - 4 26'

        it('should determine proper starting square if it is already a square', () => {
            expect(determineStartingSquare(['a3', 'a4'], someFen)).toBe('a3')
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

    describe('computerMVPGuess', () => {

        // it('should derive the correct guess when a few results are fed in, one with two', () => {
        //     const rawResults = ['random stuff', 'A3 goes to A4', 'h2', 'a-3 goes to a-4', 'more random stuff with ending h2']
        //     expect(computerMVPGuess(rawResults)).toEqual(['a3', 'a4'])
        // })

        // it('should derive the correct guess when a few results are fed in, but only valid one is a pawn moving', () => {
        //     const rawResults = ['random stuff', 'haha goes to no', 'h2', 'a-3 goes to a-4', 'more random stuff']
        //     expect(computerMVPGuess(rawResults)).toEqual(['a3'])
        // })

        // it('should return an empty guess if there are no plausible results', () => {
        //     const rawResults = ['sdfjsio', 'ay one 1 2 3 ', 'n p 4', 'haha', 'a-3 goes to a-4', 'more random stuff']
        //     expect(computerMVPGuess(rawResults)).toEqual(['a3'])
        // })

    })

})
