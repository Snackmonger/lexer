"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var TextSymbol;
(function (TextSymbol) {
    TextSymbol["NEWLINE"] = "\n";
    TextSymbol["HYPHEN"] = "-";
    TextSymbol["CARET"] = "^";
})(TextSymbol || (TextSymbol = {}));
var UnknownSymbolError = /** @class */ (function (_super) {
    __extends(UnknownSymbolError, _super);
    function UnknownSymbolError(text, line, column) {
        var _this = this;
        var excerpt = text.split(TextSymbol.NEWLINE)[line - 1];
        var arrow = TextSymbol.HYPHEN.repeat(column - 1) + TextSymbol.CARET;
        var diagram = "Near here:\n\t\t".concat(excerpt, "\n\t\t").concat(arrow);
        var errMsg = "Unable to parse symbol at position \n      ".concat(column, " on line ").concat(line, ":\n\t").concat(diagram);
        _this = _super.call(this, errMsg) || this;
        _this.text = text;
        _this.line = line;
        _this.column = column;
        return _this;
    }
    return UnknownSymbolError;
}(Error));
/**
 * The lexical category to which a segment belongs, as well as its location
 * in the source text, both literally, and when newlines are counted.
 */
var Token = /** @class */ (function () {
    function Token(tokenType, lexeme, start, end, line, column) {
        this.tokenType = tokenType;
        this.lexeme = lexeme;
        this.start = start;
        this.end = end;
        this.line = line;
        this.column = column;
    }
    Token.prototype.toString = function () {
        return "Token(".concat(this.tokenType, ", ").concat(this.lexeme, ", ").concat(this.line, "[").concat(this.column, "])");
    };
    Object.defineProperty(Token.prototype, "length", {
        /**
         * The length of the lexeme string literal.
         */
        get: function () {
            return this.lexeme.length;
        },
        enumerable: false,
        configurable: true
    });
    return Token;
}());
/**
 * The counter that keeps track of where the lexer is looking when reading
 * the source text.
 *
 * The token templates update the tokens with their own positional and size
 * information, so the counter is only responsible for updating according
 * to the data of the single token that is actually accepted.
 */
var ProgramCounter = /** @class */ (function () {
    function ProgramCounter() {
        this.start = 0;
        this.line = 1;
        this.column = 1;
    }
    /**
     * Accept the given token and adjust the counter according to the token's
     * location in the source text.
     * @param token The token to be accepted at the current position.
     */
    ProgramCounter.prototype.accept = function (token) {
        if (token.line != this.line) {
            this.column = 1;
        }
        else {
            this.column += token.end - token.start;
        }
        this.start = token.end;
        this.line = token.line;
    };
    return ProgramCounter;
}());
/**
 * The formula for generating a token.
 *
 * This class is used by the lexer to generate tokens according to the
 * current input. Each token template associates a regular expression
 * with a token type name. An optional callback allows the template
 * to transform the literal value of the matching lexeme.
 */
var TokenTemplate = /** @class */ (function () {
    function TokenTemplate(tokenType, regexPattern, callback) {
        this.tokenType = tokenType;
        this.regexPattern = regexPattern;
        this.callback = callback;
    }
    TokenTemplate.prototype.toString = function () {
        return "TokenTemplate(".concat(this.tokenType, ", ").concat(this.regexPattern.source, ")");
    };
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
    TokenTemplate.prototype.match = function (text, start, line, column) {
        var match = text.slice(start).match(this.regexPattern);
        if (!match) {
            return null;
        }
        if (match.index != 0) {
            return null;
        }
        var lexeme = match[0];
        var end = start + lexeme.length;
        for (var _i = 0, lexeme_1 = lexeme; _i < lexeme_1.length; _i++) {
            var char = lexeme_1[_i];
            if (char == TextSymbol.NEWLINE) {
                line += 1;
                column = 1;
            }
        }
        var token = new Token(this.tokenType, lexeme, start, end, line, column);
        if (this.callback != undefined) {
            token.value = this.callback(lexeme);
        }
        return token;
    };
    return TokenTemplate;
}());
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
var Lexer = /** @class */ (function () {
    function Lexer() {
        this.templates = [];
    }
    /**
     * Define a new token production rule that will be considered when
     * tokenizing the source text.
     *
     * @param tokenType         The name of the token's lexical category.
     * @param regexPattern      A regular expression defining the lexeme.
     * @param callback          An optional transformer for the lexeme's type.
     */
    Lexer.prototype.addRule = function (tokenType, regexPattern, callback) {
        this.templates.push(new TokenTemplate(tokenType, regexPattern, callback));
    };
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
    Lexer.prototype.tokenize = function (text) {
        var filterTypes = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            filterTypes[_i - 1] = arguments[_i];
        }
        this.tokens = [];
        this.programCounter = new ProgramCounter();
        var best;
        while (this.start < text.length) {
            best = null;
            for (var _a = 0, _b = this.templates; _a < _b.length; _a++) {
                var template = _b[_a];
                var token = template.match(text, this.start, this.line, this.column);
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
        return this.tokens.filter(function (x) { return !filterTypes.includes(x.tokenType); });
    };
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
    Lexer.prototype.best = function (best, other) {
        return best.length >= other.length ? best : other;
    };
    /**
     * Accept the given token by adding it to the list of tokens and by
     * instructing the program counter to advance.
     *
     * @param token     The token to be accepted.
     */
    Lexer.prototype.accept = function (token) {
        this.tokens.push(token);
        this.programCounter.accept(token);
    };
    Object.defineProperty(Lexer.prototype, "start", {
        get: function () {
            return this.programCounter.start;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Lexer.prototype, "line", {
        get: function () {
            return this.programCounter.line;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Lexer.prototype, "column", {
        get: function () {
            return this.programCounter.column;
        },
        enumerable: false,
        configurable: true
    });
    return Lexer;
}());
exports.default = Lexer;
