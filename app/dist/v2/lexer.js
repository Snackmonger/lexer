"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var TextSymbol;
(function (TextSymbol) {
    TextSymbol["NEWLINE"] = "\n";
    TextSymbol["HYPHEN"] = "-";
    TextSymbol["CARET"] = "^";
})(TextSymbol || (TextSymbol = {}));
class UnknownSymbolError extends Error {
    text;
    line;
    column;
    constructor(text, line, column) {
        let excerpt = text.split(TextSymbol.NEWLINE)[line - 1];
        let arrow = TextSymbol.HYPHEN.repeat(column - 1) + TextSymbol.CARET;
        let diagram = `Near here:\n\t\t${excerpt}\n\t\t${arrow}`;
        let errMsg = `Unable to parse symbol at position 
      ${column} on line ${line}:\n\t${diagram}`;
        super(errMsg);
        this.text = text;
        this.line = line;
        this.column = column;
    }
}
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
            if (char == TextSymbol.NEWLINE) {
                line += 1;
                column = 1;
            }
        }
        let token = new Token(this.tokenType, lexeme, start, end, line, column);
        if (this.callback != undefined) {
            token.value = this.callback(lexeme);
        }
        return token;
    }
}
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
class Lexer {
    templates = [];
    programCounter;
    tokens;
    /**
     * Define a new token production rule that will be considered when
     * tokenizing the source text.
     *
     * @param tokenType         The name of the token's lexical category.
     * @param regexPattern      A regular expression defining the lexeme.
     * @param callback          An optional transformer for the lexeme's type.
     */
    addRule(tokenType, regexPattern, callback) {
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
    tokenize(text, ...filterTypes) {
        this.tokens = [];
        this.programCounter = new ProgramCounter();
        let best;
        while (this.start < text.length) {
            best = null;
            for (let template of this.templates) {
                let token = template.match(text, this.start, this.line, this.column);
                if (token == null) {
                    continue;
                }
                if (best == null) {
                    best = token;
                }
                else {
                    best = this.best(best, token);
                }
            }
            if (best == null) {
                throw new UnknownSymbolError(text, this.line, this.column);
            }
            this.accept(best);
        }
        return this.tokens.filter((x) => !filterTypes.includes(x.tokenType));
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
    best(best, other) {
        return best.length >= other.length ? best : other;
    }
    /**
     * Accept the given token by adding it to the list of tokens and by
     * instructing the program counter to advance.
     *
     * @param token     The token to be accepted.
     */
    accept(token) {
        this.tokens.push(token);
        this.programCounter.accept(token);
    }
    get start() {
        return this.programCounter.start;
    }
    get line() {
        return this.programCounter.line;
    }
    get column() {
        return this.programCounter.column;
    }
}
exports.default = Lexer;
//# sourceMappingURL=lexer.js.map