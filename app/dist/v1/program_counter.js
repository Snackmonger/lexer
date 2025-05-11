"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * The counter that keeps track of where the lexer is looking when reading
 * the source text.
 *
 * The token templates update the tokens with their own positional and size
 * information, so the counter is only responsible for updating according
 * to the data of the single token that is actually accepted.
 */
class ProgramCounter {
    start = 0;
    line = 1;
    column = 1;
    /**
     * Accept the given token and adjust the counter according to the token's
     * location in the source text.
     * @param token The token to be accepted at the current position.
     */
    accept(token) {
        if (token.line != this.line) {
            this.column = 1;
        }
        else {
            this.column += token.end - token.start;
        }
        this.start = token.end;
        this.line = token.line;
    }
}
exports.default = ProgramCounter;
//# sourceMappingURL=program_counter.js.map