import { Keywords, TokenType, type Token } from './tokens.js';
import { Diagnostic } from './errors.js';
import { isAlphaNumeric, isDigit, isAlpha, unescapeString } from './utils.js';

export class Lexer {
  private start = 0;   // index of token start
  private current = 0; // current index in the token
  private line = 1;
  private column = 1;
  private tokens: Token[] = [];

  constructor(private readonly source: string) { }

  lex(): Token[] {
    while (!this.isAtEnd()) {
      this.start = this.current;
      this.scanToken();
    }
    this.tokens.push(this.makeToken(TokenType.EOF, ''));
    return this.tokens;
  }

  private isAtEnd() {
    return this.current >= this.source.length;
  }

  private peek() {
    return this.source[this.current] ?? '\0';
  }

  private peekNext() {
    return this.source[this.current + 1] ?? '\0';
  }

  private advance() {
    const char = this.source[this.current++] ?? '\0';
    if (char === '\n') {
      this.line++;
      this.column = 1;
    } else {
      this.column++;
    }
    return char;
  }

  private match(expected: string): boolean {
    if (this.peek() !== expected) {
      return false;
    }
    this.advance();
    return true;
  }

  private makeToken(type: TokenType, lexeme: string, literal?: any): Token {
    const length = [...lexeme].length;  // Unicode length
    const column = this.column - length;
    return {
      type,
      lexeme,
      literal,
      line: this.line,
      column,
      length,
    };
  }

  private addToken(type: TokenType, literal?: any) {
    const lexeme = this.source.slice(this.start, this.current);
    this.tokens.push(this.makeToken(type, lexeme, literal));
  }

  private scanToken() {
    const c = this.advance();
    switch (c) {
      // whitespace (handled in advance)
      case ' ':
      case '\r':
      case '\t':
      case '\n':
        return;

      case '/': {
        // single-line comment
        if (this.match('/')) {
          while (!this.isAtEnd() && this.peek() !== '\n') {
            this.advance();
          }
          return;
        }
        // multi-line comment
        if (this.match('*')) {
          this.blockComment();
          return;
        }
        // otherwise, division operator
        this.addToken(TokenType.SLASH);
        return;
      }

      // single-char tokens
      case '(': {
        this.addToken(TokenType.LEFT_PAREN);
        return;
      }
      case ')': {
        this.addToken(TokenType.RIGHT_PAREN);
        return;
      }
      case '{': {
        this.addToken(TokenType.LEFT_BRACE);
        return;
      }
      case '}': {
        this.addToken(TokenType.RIGHT_BRACE);
        return;
      }
      case '[': {
        this.addToken(TokenType.LEFT_BRACKET);
        return;
      }
      case ']': {
        this.addToken(TokenType.RIGHT_BRACKET);
        return;
      }
      case ',': {
        this.addToken(TokenType.COMMA);
        return;
      }
      case '.': {
        this.addToken(TokenType.DOT);
        return;
      }
      case ';': {
        this.addToken(TokenType.SEMICOLON);
        return;
      }
      case ':': {
        this.addToken(TokenType.COLON);
        return;
      }

      // compound or operators
      case '#': {
        if (this.match('{')) {
          this.addToken(TokenType.SET_LBRACE);
          return;
        }
        throw new Diagnostic(
          "Unexpected '#', did you mean '#{' for a set literal?",
          this.line, this.column - 1, 1
        );
      }
      case '!': {
        if (this.match('=')) {
          this.addToken(TokenType.BANG_EQUAL);
        } else {
          this.addToken(TokenType.BANG);
        }
        return;
      }
      case '=': {
        if (this.match('=')) {
          this.addToken(TokenType.EQUAL_EQUAL);
        } else {
          this.addToken(TokenType.EQUAL);
        }
        return;
      }
      case '<': {
        if (this.match('=')) {
          this.addToken(TokenType.LESS_EQUAL);
        } else {
          this.addToken(TokenType.LESS);
        }
        return;
      }
      case '>': {
        if (this.match('=')) {
          this.addToken(TokenType.GREATER_EQUAL);
        } else {
          this.addToken(TokenType.GREATER);
        }
        return;
      }
      case '&': {
        if (this.match('&')) {
          this.addToken(TokenType.AND_AND);
        }
        return;
      }
      case '|': {
        if (this.match('|')) {
          this.addToken(TokenType.OR_OR);
        }
        return;
      }
      case '+': {
        this.addToken(TokenType.PLUS);
        return;
      }
      case '-': {
        this.addToken(TokenType.MINUS);
        return;
      }
      case '%': {
        this.addToken(TokenType.PERCENT);
        return;
      }
      case '*': {
        if (this.match('*')) {
          this.addToken(TokenType.STAR_STAR);
        } else {
          this.addToken(TokenType.STAR);
        }
        return;
      }

      // literals/indentifiers
      case '"':
      case '\'': {
        this.string(c);
        return;
      }
      default: {
        if (isDigit(c)) {
          this.numberOrBigInt();
          return;
        }
        if (isAlpha(c)) {
          this.identifier();
          return;
        }
        throw new Diagnostic(`Unexpected character '${c}'`, this.line, this.column - 1, 1);
      }
    }
  }

  private blockComment() {
    let depth = 1;
    while (!this.isAtEnd() && depth > 0) {
      const c = this.advance();
      if (c === '/' && this.peek() === '*') {
        this.advance(); // consume '*'
        depth++;
      } else if (c === '*' && this.peek() === '/') {
        this.advance(); // consume '/'
        depth--;
      }
    }
    if (depth !== 0) {
      throw new Diagnostic('Unterminated block comment', this.line, this.column - 1, 2);
    }
  }

  private string(quote: string) {
    while (!this.isAtEnd() && this.peek() !== quote) {
      if (this.peek() === '\n') {
        throw new Diagnostic('Unterminated string literal', this.line, this.column - 1, 1);
      }
      if (this.peek() === '\\') {
        this.advance();
      }
      this.advance();
    }
    if (!this.isAtEnd()) {
      throw new Diagnostic(
        `Unexpected character '${this.peek()}' in string literal`,
        this.line, this.column - 1, 1
      )
    }
    // closing quote
    this.advance();
    const text = this.source.slice(this.start + 1, this.current - 1);
    this.addToken(TokenType.STRING, unescapeString(text));
  }

  private numberOrBigInt() {
    // integer or float or bigint (with 'n' suffix)
    while (isDigit(this.peek())) {
      this.advance();
    }

    // decimal part
    if (this.peek() === '.' && isDigit(this.peekNext())) {
      this.advance(); // consume '.'
      while (isDigit(this.peek())) {
        this.advance();
      }
    }

    // exponent part (only for number)
    if (this.peek() === 'e' || this.peek() === 'E') {
      const save = this.current;
      this.advance(); // consume 'e' or 'E'
      if (this.peek() === '+' || this.peek() === '-') {
        this.advance(); // consume optional sign
      }
      if (!isDigit(this.peek())) {
        this.current = save; // revert to original position
        this.column -= 1;
      } else {
        while (isDigit(this.peek())) {
          this.advance();
        }
      }
    }

    // bigint suffix - only if no decimal/exponent
    const lexeme = this.source.slice(this.start, this.current);
    const hasDot = lexeme.includes('.');
    const hasExponent = /[eE]/.test(lexeme);
    if (!hasDot && !hasExponent && this.peek() === 'n') {
      this.advance();
      const text = this.source.slice(this.start, this.current);
      const digits = text.slice(0, -1);
      this.addToken(TokenType.BIGINT, BigInt(digits));
      return;
    }

    this.addToken(TokenType.NUMBER, Number(lexeme));
  }

  private identifier() {
    while (isAlphaNumeric(this.peek())) {
      this.advance();
    }
    const text = this.source.slice(this.start, this.current);
    const kw = Keywords[text];
    if (kw !== undefined) {
      this.addToken(kw);
      return;
    }
    this.addToken(TokenType.IDENTIFIER, text);
  }
}
