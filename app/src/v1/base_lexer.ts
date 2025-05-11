import { UnknownSymbolError } from "./errors";
import ProgramCounter from "./program_counter";
import Token from "./token";
import TokenTemplate from "./token_template";

/**
 * A text reader that sorts raw text into lexical categories.
 * 
 * The user must use the `addRule` method to define productions for
 * the set of terminals that the lexer will try to match. The lexer 
 * then crawls through the source text and checks the list of rules
 * for matches at the current position. If no match is found, an error
 * will be raised with details about the problem position. If multiple
 * matches are found, the match with the longest literal is accepted.
 * When a match is accepted, the program counter moves forward according
 * to the length of the match's literal.
 * 
 * NOTE: The lexer does NOT automatically ignore any characters. Therefore,
 * whitespace, tabs, etc. have to be accounted for in the rule set. If these
 * tokens are not actually needed, then a list of token type names can be 
 * passed as the `filterTypes` parameter to the `tokenize` method in order to 
 * exclude them from the final result.
 */
export default class Lexer {

    private templates: TokenTemplate[] = [];
    private programCounter: ProgramCounter;
    private tokens: Token[];

    /**
     * Define a new token production rule that will be considered when 
     * tokenizing the source text. 
     * 
     * @param tokenType         The name of the token's lexical category.
     * @param regexPattern      A regular expression defining the lexeme.
     * @param callback          An optional transformer for the lexeme's type.
     */
    public addRule(tokenType: string, regexPattern: RegExp, callback?: (lexeme: string) => unknown) {
        this.templates.push(new TokenTemplate(tokenType, regexPattern, callback));
    }

    /**
     * Attempt to sort a source text into lexical categories, represented
     * as tokens.
     * 
     * IMPORTANT: The lexer does not ignore whitespaces, newlines, tabs, etc. 
     * by default. You must define a token template to capture unwanted 
     * characters, then you can add them to the a list of filter_types,
     * which will omit tokens with those labels from the final return.
     * 
     * @param text          A source document to be tokenized.
     * @param filterTypes   Token type names that will be excluded from output.
     * @returns             A list of tokens representing the source text.
     */
    public tokenize(text: string, ...filterTypes: string[]) {
        this.tokens = [];
        this.programCounter = new ProgramCounter();
        let best: Token | null; 
        while (this.start < text.length) {
            best = null;
            for (let template of this.templates) {
                let token: Token | null = template.match(text, this.start, this.line, this.column);
                if (token == null) {
                    continue;
                }
                if (best == null) {
                    best = token
                }
                else {
                    best = this.best(best, token);
                }
            }
            if (best == null) {
                throw new UnknownSymbolError(text, this.line, this.column);
            }
            this.accept(best)
        }
        return this.tokens.filter((x) => !filterTypes.includes(x.tokenType))
    }

    /**
     * Compare the current best token to another token.
     * 
     * By default, this checks the longest lexeme match. Override this
     * function or replace its logic to implement a different algorithm.
     * 
     * @param best      The current best token.
     * @param other     Another token for comparison.
     * @returns         The better of the two tokens.
     */
    private best(best: Token, other: Token): Token {
        return (best.length >= other.length) ? best : other;
    }

    /**
     * Accept the given token by adding it to the list of tokens and by 
     * instructing the program counter to advance.
     * 
     * @param token     The token to be accepted.
     */
    private accept(token: Token) {
        this.tokens.push(token);
        this.programCounter.accept(token);
    }

    get start(): number {
        return this.programCounter.start;
    }
    get line(): number {
        return this.programCounter.line;
    }
    get column(): number {
        return this.programCounter.column;
    }
}