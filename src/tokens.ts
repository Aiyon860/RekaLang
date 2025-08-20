export enum TokenType {
  // Single-character tokens
  LEFT_PAREN,
  RIGHT_PAREN,
  LEFT_BRACE,
  RIGHT_BRACE,
  LEFT_BRACKET,
  RIGHT_BRACKET,
  COMMA,
  DOT,
  SEMICOLON,
  COLON,

  // Set literal opener '#{'
  SET_LBRACE,

  // Operators
  PLUS,
  MINUS,
  STAR,
  SLASH,
  PERCENT,
  STAR_STAR,
  BANG,
  BANG_EQUAL,
  EQUAL,
  EQUAL_EQUAL,
  GREATER,
  GREATER_EQUAL,
  LESS,
  LESS_EQUAL,
  AND_AND,
  OR_OR,
  //  TODO: add ternary operator support

  // Literals & Identifiers
  IDENTIFIER,
  STRING,
  NUMBER,
  BIGINT,

  // Keywords
  VAR,
  CONST,
  FUNC,
  RETURN,
  IF,
  ELSE,
  WHILE,
  FOR,
  BREAK,
  CONTINUE,
  TRUE,
  FALSE,
  NULL,

  // End of file
  EOF
}

export type Literal = string | number | bigint | boolean | null;

export interface Token {
  type: TokenType;
  lexeme: string;
  literal?: Literal;
  line: number;   // 1-based
  column: number; // 1 based
  length: number; // in UTF-16 code units (TS Strings)
}

export const Keywords: Record<string, TokenType> = {
  var: TokenType.VAR,
  const: TokenType.CONST,
  func: TokenType.FUNC,
  return: TokenType.RETURN,
  if: TokenType.IF,
  else: TokenType.ELSE,
  while: TokenType.WHILE,
  for: TokenType.FOR,
  break: TokenType.BREAK,
  continue: TokenType.CONTINUE,
  true: TokenType.TRUE,
  false: TokenType.FALSE,
  null: TokenType.NULL,
}
