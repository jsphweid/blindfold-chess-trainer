import ChessPlayground from './chess-playground'

describe('ChessPlayground', () => {

    const defaultFen: string = '2n1r3/p1k2pp1/B1p3b1/P7/4NbP1/3PB3/1P2KP2/2R5 w - - 4 26'
    let chessPlayground: ChessPlayground

    beforeEach(() => {
        chessPlayground = new ChessPlayground()
    })

    afterEach(() => {
        chessPlayground = null
    })

    describe('determinePawnStartingSquare', () => {

        it('should return b2 if you give it b4', () => {
            expect(chessPlayground.determinePawnStartingSquare('b4', defaultFen)).toBe('b2')
        })

        it('should return f2 if you give it f3', () => {
            expect(chessPlayground.determinePawnStartingSquare('b4', defaultFen)).toBe('b2')
        })

        it('should return null if you give it d3', () => {
            expect(chessPlayground.determinePawnStartingSquare('d3', defaultFen)).toBe(null)
        })

        it('should return null if you give it d5 (because it cant move 2 after initial movement)', () => {
            expect(chessPlayground.determinePawnStartingSquare('d5', defaultFen)).toBe(null)
        })

    })

    describe('determineWhichSquareIsValidMove', () => {

        it('should determine a6 bishop when asking to disambiguate between the two: 1', () => {
            expect(chessPlayground.determineWhichSquareIsValidMove(['a6', 'e3'], 'b5', defaultFen)).toBe('a6')
        })

        it('should determine a6 bishop when asking to disambiguate between the two: 2', () => {
            expect(chessPlayground.determineWhichSquareIsValidMove(['a6', 'e3'], 'c4', defaultFen)).toBe('a6')
        })

        it('should determine e3 bishop when asking to disambiguate between the two: 1', () => {
            expect(chessPlayground.determineWhichSquareIsValidMove(['a6', 'e3'], 'd4', defaultFen)).toBe('e3')
        })

        it('should determine e3 bishop when asking to disambiguate between the two: 2', () => {
            expect(chessPlayground.determineWhichSquareIsValidMove(['a6', 'e3'], 'b6', defaultFen)).toBe('e3')
        })

        it('should determine null when asking to disambiguate between the two in an impossible circumstance', () => {
            expect(chessPlayground.determineWhichSquareIsValidMove(['a6', 'e3'], 'h8', defaultFen)).toBe(null)
        })

    })

    describe('getDescriptiveMove', () => {

        it('should make "rook moves to c3?" if raw move is c1 to c3', () => {
            expect(chessPlayground.getDescriptiveMove({ from: 'c1', to: 'c3' }, defaultFen)).toBe('rook moves to c3?')
        })

        it('should make "pawn moves to b4?" if raw move is null to b4', () => {
            expect(chessPlayground.getDescriptiveMove({ from: null, to: 'b4' }, defaultFen)).toBe('pawn moves to b4?')
        })

        it('should make "bishop takes bishop at f4?" when raw move is e3 to f4', () => {
            expect(chessPlayground.getDescriptiveMove({ from: 'e3', to: 'f4' }, defaultFen)).toBe('bishop takes bishop at f4?')
        })

        it('should make "bishop takes knight at c8?" when raw move is a6 to c8', () => {
            expect(chessPlayground.getDescriptiveMove({ from: 'a6', to: 'c8' }, defaultFen)).toBe('bishop takes knight at c8?')
        })

    })

    describe('getWhichPawnCanCastleThere', () => {

        const fen: string = '1rBk3r/P5P1/2p2p2/8/4b1P1/3PB3/1P2KP2/2b5 w - - 1 32'

        it('should choose a7 pawn', () => {
            expect(chessPlayground.getWhichPawnCanCastleThere(['a7', 'g7'], 'a8', fen)).toBe('a7')
        })

        it('should choose a7 pawn', () => {
            expect(chessPlayground.getWhichPawnCanCastleThere(['a7', 'g7'], 'b8', fen)).toBe('a7')
        })

        it('should choose g7 pawn', () => {
            expect(chessPlayground.getWhichPawnCanCastleThere(['a7', 'g7'], 'g8', fen)).toBe('g7')
        })

        it('should choose g7 pawn', () => {
            expect(chessPlayground.getWhichPawnCanCastleThere(['a7', 'g7'], 'h8', fen)).toBe('g7')
        })

        it('should return null since no pawn can castle here', () => {
            expect(chessPlayground.getWhichPawnCanCastleThere(['a7', 'g7'], 'e8', fen)).toBe(null)
        })

    })

})
