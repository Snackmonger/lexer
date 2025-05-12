# Simple Lexer

## Description
This project was my first foray into javascript/typescript. I basically tried to devour all the grammar over a couple days, then test myself by writing a sample program. I chose a lexer because it's a fairly small and manageable project with a high chance of completion success (i.e. an ideal project for getting used to a new language).

## Use
Initialize the lexer, then define the rules that will be tokenized:

```typescript
let chordSymbolLexer = new Lexer();

enum ChordElements {
  ROOT = "root",
  SLASH = "slash",
  MAJOR = "major",
  MINOR = "minor",
  DIMINISHED = "diminished",
  AUGMENTED = "augmented",
  HALF_DIMINISHED = "half_diminished",
  PLAIN_7 = "plain_extension",
  MAJOR_7 = "major_extension",
  PLAIN_6 = "sixth_extension",
  ALTERED = "altered",
  ADD = "add",
  NO = "no",
  SUS = "sus",
}

chordSymbolLexer.addRule(ChordElements.ROOT, /([A-G])(#+|b+)?/);
chordSymbolLexer.addRule(ChordElements.MAJOR, /(maj|M|ma|Ma|MA|Δ)/);
chordSymbolLexer.addRule(ChordElements.MINOR, /(min|mi|m|-)/);
chordSymbolLexer.addRule(ChordElements.DIMINISHED, /(dim|o)/);
chordSymbolLexer.addRule(ChordElements.HALF_DIMINISHED, /(ø)/);
chordSymbolLexer.addRule(ChordElements.AUGMENTED, /(aug|\+)/);
chordSymbolLexer.addRule(ChordElements.PLAIN_7, /(13|11|9|7)/);
chordSymbolLexer.addRule(ChordElements.PLAIN_6, /(6)/);
chordSymbolLexer.addRule(ChordElements.NO, /no(#+|b+)?(13|11|9|7|6|5|4|3|2)/);
chordSymbolLexer.addRule(ChordElements.SUS, /sus(#+|b+)?(4|2)/);
chordSymbolLexer.addRule(ChordElements.SLASH, /\/([A-G])(#+|b+)?/);
chordSymbolLexer.addRule(
  ChordElements.MAJOR_7, /(maj|M|ma|Ma|MA|Δ)(13|11|9|7)/);
chordSymbolLexer.addRule(
  ChordElements.ALTERED, /(#+|b+)(13|11|9|7|6|5|4|3|2)/);
chordSymbolLexer.addRule(
  ChordElements.ADD, /add(#+|b+)?(13|11|9|7|6|5|4|3|2)/);
```
Once this is done, the lexer is ready to tokenize text:
```typescript
let results = chordSymbolLexer.tokenize("Cmaj7#11");
```

```typescript
[
  Token {
    tokenType: 'root',
    lexeme: 'C',
    start: 0,
    end: 1,
    line: 1,
    column: 1,
    value: undefined
  },
  Token {
    tokenType: 'major_extension',
    lexeme: 'maj7',
    start: 1,
    end: 5,
    line: 1,
    column: 2,
    value: undefined
  },
  Token {
    tokenType: 'altered',
    lexeme: '#11',
    start: 5,
    end: 8,
    line: 1,
    column: 6,
    value: undefined
  }
]
```
