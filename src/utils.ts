export function isDigit(char: string): boolean {
  return char >= '0' && char <= '9';
}

export function isAlpha(char: string): boolean {
  return (
    (char >= 'a' && char <= 'z') ||
    (char >= 'A' && char <= 'Z') ||
    char === '_'
  );
}

export function isAlphaNumeric(char: string): boolean {
  return isAlpha(char) || isDigit(char);
}

export function unescapeString(str: string): string {
  return str.replace(/\\n/g, '\n')
    .replace(/\\t/g, '\t')
    .replace(/\\r/g, '\r')
    .replace(/\\b/g, '\b')
    .replace(/\\f/g, '\f')
    .replace(/\\v/g, '\v')
    .replace(/\\'/g, '\'')
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, '\\');
}
