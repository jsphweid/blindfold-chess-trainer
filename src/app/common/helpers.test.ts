import { NotationType } from './generatedTypes'
import { computerMVPGuess, getReactChessStateFromFen, tryToFindKeyWords } from './helpers'

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

    })

    describe('computerMVPGuess', () => {

        it('should derive the correct guess when a few results are fed in, one with two', () => {
            const rawResults = ['random stuff', 'A3 goes to A4', 'h2', 'a-3 goes to a-4', 'more random stuff with ending h2']
            expect(computerMVPGuess(rawResults)).toEqual(['a3', 'a4'])
        })

        it('should derive the correct guess when a few results are fed in, but only valid one is a pawn moving', () => {
            const rawResults = ['random stuff', 'A3 goes to A4', 'h2', 'a-3 goes to a-4', 'more random stuff with ending h2']
            expect(computerMVPGuess(rawResults)).toEqual(['a3', 'a4'])
        })

    })

})
