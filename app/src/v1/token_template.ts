import Token from "./token";
import { TextSymbol } from "./enums";

/**
 * The formula for generating a token.
 * 
 * This class is used by the lexer to generate tokens according to the 
 * current input. Each token template associates a regular expression 
 * with a token type name. An optional callback allows the template
 * to transform the literal value of the matching lexeme.
 */
export default class TokenTemplate {

    constructor(
      readonly tokenType: string,
      private readonly regexPattern: RegExp,
      private readonly callback?: (lexeme: string) => unknown

    ) {
    }

    toString(): string {
        return `TokenTemplate(${ this.tokenType }, ${ this.regexPattern.source })`
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
    match(
        text: string, 
        start: number, 
        line: number, 
        column: number
    ): Token | null {
        
        let match = text.slice(start).match(this.regexPattern);
        if (!match) {

            return null;
        }
        if (match.index != 0){
            return null;
        }

        let lexeme = match[0];
        let end = start + lexeme.length;
        for (let char of lexeme) {
            if (char == TextSymbol.NEWLINE) {
                line += 1;
                column = 1;
            }
        };

        let token = new Token(this.tokenType, lexeme, start, end, line, column);
        if (this.callback != undefined) {
            token.value = this.callback(lexeme);
        }
        return token;
    }
}