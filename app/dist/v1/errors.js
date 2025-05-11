"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnknownSymbolError = void 0;
const enums_1 = require("./enums");
class UnknownSymbolError extends Error {
    text;
    line;
    column;
    constructor(text, line, column) {
        let excerpt = text.split(enums_1.TextSymbol.NEWLINE)[line - 1];
        let arrow = enums_1.TextSymbol.HYPHEN.repeat(column - 1) + enums_1.TextSymbol.CARET;
        let diagram = `Near here:\n\t\t${excerpt}\n\t\t${arrow}`;
        let errMsg = `Unable to parse symbol at position 
      ${column} on line ${line}:\n\t${diagram}`;
        super(errMsg);
        this.text = text;
        this.line = line;
        this.column = column;
    }
}
exports.UnknownSymbolError = UnknownSymbolError;
//# sourceMappingURL=errors.js.map