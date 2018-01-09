// const joinString = ` | `
const joinString = ', '
console.log(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].map((letter) => {
    return ['1', '2', '3', '4', '5', '6', '7', '8'].map((number) => {
        return ['p', 'r', 'n', 'b', 'k', 'q', 'P', 'R', 'N', 'B', 'K', 'Q'].map((piece) => {
            return `'${piece}@${letter}${number}'`
        }).join(joinString)
    }).join(joinString)
}).join(joinString))

console.log(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].map((letter) => {
    return ['1', '2', '3', '4', '5', '6', '7', '8'].map((number) => {
        return `'${letter}${number}'`
    }).join(joinString)
}).join(joinString))
