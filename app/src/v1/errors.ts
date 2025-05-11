import { TextSymbol } from "./enums";

export class UnknownSymbolError extends Error {
  constructor(
    readonly text: string,
    readonly line: number,
    readonly column: number
  ) {
    let excerpt = text.split(TextSymbol.NEWLINE)[line - 1];
    let arrow = TextSymbol.HYPHEN.repeat(column - 1) + TextSymbol.CARET;
    let diagram = `Near here:\n\t\t${excerpt}\n\t\t${arrow}`;
    let errMsg =
      `Unable to parse symbol at position 
      ${column} on line ${line}:\n\t${diagram}`;
    super(errMsg);
  }
}
