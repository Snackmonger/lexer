import Token from "./token";


/**
 * The counter that keeps track of where the lexer is looking when reading
 * the source text. 
 * 
 * The token templates update the tokens with their own positional and size
 * information, so the counter is only responsible for updating according
 * to the data of the single token that is actually accepted.
 */
export default class ProgramCounter {

    public start: number = 0;
    public line: number = 1;
    public column: number = 1;

    /**
     * Accept the given token and adjust the counter according to the token's
     * location in the source text.
     * @param token The token to be accepted at the current position.
     */
    accept(token: Token): void {
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