const { Chess } = require("chess.js")

const chess = new Chess()

console.log(chess.turn());
chess.move('e4')
chess.move('e5')
console.log(chess.moves());