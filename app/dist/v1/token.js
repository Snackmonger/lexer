"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * The lexical category to which a segment belongs, as well as its location
 * in the source text, both literally, and when newlines are counted.
 */
class Token {
    tokenType;
    lexeme;
    start;
    end;
    line;
    column;
    /**
     * Initialize a new token.
     *
     * @param tokenType   The main lexical category of the token
     * @param lexeme      The literal lexeme that generated the token.
     * @param start       The start index in the source text.
     * @param end         The end index in the source text.
     * @param line        The line in the source text, counting newlines.
     * @param column      The column in the source text, counting newlines.
     */
    value;
    constructor(tokenType, lexeme, start, end, line, column) {
        this.tokenType = tokenType;
        this.lexeme = lexeme;
        this.start = start;
        this.end = end;
        this.line = line;
        this.column = column;
    }
    toString() {
        return `Token(${this.tokenType}, ${this.lexeme}, ${this.line}[${this.column}])`;
    }
    /**
     * The length of the lexeme string literal.
     */
    get length() {
        return this.lexeme.length;
    }
}
exports.default = Token;
//# sourceMappingURL=token.js.map