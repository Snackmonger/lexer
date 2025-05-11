"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const token_1 = __importDefault(require("./token"));
const enums_1 = require("./enums");
/**
 * The formula for generating a token.
 *
 * This class is used by the lexer to generate tokens according to the
 * current input. Each token template associates a regular expression
 * with a token type name. An optional callback allows the template
 * to transform the literal value of the matching lexeme.
 */
class TokenTemplate {
    tokenType;
    regexPattern;
    callback;
    constructor(tokenType, regexPattern, callback) {
        this.tokenType = tokenType;
        this.regexPattern = regexPattern;
        this.callback = callback;
    }
    toString() {
        return `TokenTemplate(${this.tokenType}, ${this.regexPattern.source})`;
    }
    /**
     * Check if a match can be made at the current position in the source
     * text and generate a token if so, or return null if not.
     *
     * @param text      The source text to be analyzed
     * @param start     The position in the text to check for a match
     * @param line      The linebreak-sensitive line count
     * @param column    The linebreak-sensistive column count
     * @returns         A new token or null.
     */
    match(text, start, line, column) {
        let match = text.slice(start).match(this.regexPattern);
        if (!match) {
            return null;
        }
        if (match.index != 0) {
            return null;
        }
        let lexeme = match[0];
        let end = start + lexeme.length;
        for (let char of lexeme) {
            if (char == enums_1.TextSymbol.NEWLINE) {
                line += 1;
                column = 1;
            }
        }
        ;
        let token = new token_1.default(this.tokenType, lexeme, start, end, line, column);
        if (this.callback != undefined) {
            token.value = this.callback(lexeme);
        }
        return token;
    }
}
exports.default = TokenTemplate;
//# sourceMappingURL=token_template.js.map