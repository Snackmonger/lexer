/**
 * This test uses the lexer to decompose chord symbols into their constituents.
 */
import util from "util";
import Lexer from "../src/v2/lexer";


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

let chordSymbolLexer = new Lexer();

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

type TokenData = {
  tokenType: string,
  lexeme: string
};
type ChordData = {
  chordSymbol: string,
  tokens: TokenData[]
}

function tokenizeChord(chordSymbol: string): ChordData { 
  let tokens: TokenData[] = [];
  for (let t of chordSymbolLexer.tokenize(chordSymbol)) {
    tokens.push({tokenType: t.tokenType, lexeme: t.lexeme});
  }
  return {
    chordSymbol: chordSymbol,
    tokens: tokens
  };
}

let tests = [
{
  chordSymbol: 'Cmaj7#11',
  tokens: [
    { tokenType: 'root', lexeme: 'C' },
    { tokenType: 'major_extension', lexeme: 'maj7' },
    { tokenType: 'altered', lexeme: '#11' }
  ]
},
{
  chordSymbol: 'Amin7b5',
  tokens: [
    { tokenType: 'root', lexeme: 'A' },
    { tokenType: 'minor', lexeme: 'min' },
    { tokenType: 'plain_extension', lexeme: '7' },
    { tokenType: 'altered', lexeme: 'b5' }
  ]
},
{
  chordSymbol: 'Gdim7',
  tokens: [
    { tokenType: 'root', lexeme: 'G' },
    { tokenType: 'diminished', lexeme: 'dim' },
    { tokenType: 'plain_extension', lexeme: '7' }
  ]
},
{
  chordSymbol: 'Eb13',
  tokens: [
    { tokenType: 'root', lexeme: 'Eb' },
    { tokenType: 'plain_extension', lexeme: '13' }
  ]
},
{
  chordSymbol: 'G7b9',
  tokens: [
    { tokenType: 'root', lexeme: 'G' },
    { tokenType: 'plain_extension', lexeme: '7' },
    { tokenType: 'altered', lexeme: 'b9' }
  ]
},
{
  chordSymbol: 'Gb7b9',
  tokens: [
    { tokenType: 'root', lexeme: 'Gb' },
    { tokenType: 'plain_extension', lexeme: '7' },
    { tokenType: 'altered', lexeme: 'b9' }
  ]
},
{
  chordSymbol: 'Bb7b9',
  tokens: [
    { tokenType: 'root', lexeme: 'Bb' },
    { tokenType: 'plain_extension', lexeme: '7' },
    { tokenType: 'altered', lexeme: 'b9' }
  ]
},
{
  chordSymbol: 'Bb9b11',
  tokens: [
    { tokenType: 'root', lexeme: 'Bb' },
    { tokenType: 'plain_extension', lexeme: '9' },
    { tokenType: 'altered', lexeme: 'b11' }
  ]
},
{
  chordSymbol: 'F#aug7',
  tokens: [
    { tokenType: 'root', lexeme: 'F#' },
    { tokenType: 'augmented', lexeme: 'aug' },
    { tokenType: 'plain_extension', lexeme: '7' }
  ]
},
{
  chordSymbol: 'Ab7aug',
  tokens: [
    { tokenType: 'root', lexeme: 'Ab' },
    { tokenType: 'plain_extension', lexeme: '7' },
    { tokenType: 'augmented', lexeme: 'aug' }
  ]
},
{
  chordSymbol: 'C#minmaj7',
  tokens: [
    { tokenType: 'root', lexeme: 'C#' },
    { tokenType: 'minor', lexeme: 'min' },
    { tokenType: 'major_extension', lexeme: 'maj7' }
  ]
},
{
  chordSymbol: 'GmM7',
  tokens: [
    { tokenType: 'root', lexeme: 'G' },
    { tokenType: 'minor', lexeme: 'm' },
    { tokenType: 'major_extension', lexeme: 'M7' }
  ]
},
{
  chordSymbol: 'Csus2',
  tokens: [
    { tokenType: 'root', lexeme: 'C' },
    { tokenType: 'sus', lexeme: 'sus2' }
  ]
},
{
  chordSymbol: 'Aadd9',
  tokens: [
    { tokenType: 'root', lexeme: 'A' },
    { tokenType: 'add', lexeme: 'add9' }
  ]
},
{
  chordSymbol: 'Gbno5',
  tokens: [
    { tokenType: 'root', lexeme: 'Gb' },
    { tokenType: 'no', lexeme: 'no5' }
  ]
},
{
  chordSymbol: 'E7/G#',
  tokens: [
    { tokenType: 'root', lexeme: 'E' },
    { tokenType: 'plain_extension', lexeme: '7' },
    { tokenType: 'slash', lexeme: '/G#' }
  ]
},
{
  chordSymbol: 'D9b13',
  tokens: [
    { tokenType: 'root', lexeme: 'D' },
    { tokenType: 'plain_extension', lexeme: '9' },
    { tokenType: 'altered', lexeme: 'b13' }
  ]
},
{
  chordSymbol: 'F7b11',
  tokens: [
    { tokenType: 'root', lexeme: 'F' },
    { tokenType: 'plain_extension', lexeme: '7' },
    { tokenType: 'altered', lexeme: 'b11' }
  ]
},
{
  chordSymbol: 'E7add11',
  tokens: [
    { tokenType: 'root', lexeme: 'E' },
    { tokenType: 'plain_extension', lexeme: '7' },
    { tokenType: 'add', lexeme: 'add11' }
  ]
},
{
  chordSymbol: 'A#min7b9',
  tokens: [
    { tokenType: 'root', lexeme: 'A#' },
    { tokenType: 'minor', lexeme: 'min' },
    { tokenType: 'plain_extension', lexeme: '7' },
    { tokenType: 'altered', lexeme: 'b9' }
  ]
},
{
  chordSymbol: 'Gbmajadd9',
  tokens: [
    { tokenType: 'root', lexeme: 'Gb' },
    { tokenType: 'major', lexeme: 'maj' },
    { tokenType: 'add', lexeme: 'add9' }
  ]
}
];

function runTests(tests: ChordData[], verbose: boolean = false): [number, number] {
  let success = 0;
  let failure = 0;
  for (let test of tests) {
    let result: ChordData
    try {  
      result = tokenizeChord(test.chordSymbol); 
    } 
    catch (error) {
      console.log(`FAILURE for ${test.chordSymbol} with error: ${error}`);
      failure += 1;
      continue;
    }
    if (util.isDeepStrictEqual(result.tokens, test.tokens)) {
      if (verbose) {console.log(`SUCCESS for ${test.chordSymbol}`);}
      success += 1;
    }
    else {
      console.log(`FAILURE for ${test.chordSymbol}. Expected: ${test.tokens} Got: ${result.tokens}`);
      failure += 1;
    }
  }

  console.log(`${success}/${success + failure} tests passed.`)
  return [success, success + failure]
}

runTests(tests);