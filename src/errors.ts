export class RekaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RekaError";
  }
}

export class Diagnostic extends RekaError {
  constructor(
    message: string,
    public readonly line: number,
    public readonly column: number,
    public readonly length: number,
  ) {
    super(message);
    this.name = "Diagnostic";
  }
}

export function buildLineStarts(source: string): number[] {
  const starts = [0];
  for (let i = 0; i < source.length; ++i) {
    if (source[i] === '\n') {
      starts.push(i + 1);
    }
  }
  return starts;
}

export function sliceLine(
  source: string,
  lineStarts: number[],
  line1: number
): string {
  const idx = line1 - 1; // Convert to 0-based index
  const start = lineStarts[idx] ?? 0;
  const end = lineStarts[idx + 1] ?? source.length;
  return source.slice(start, end).replace(/\r?\n$/, '');
}

export function renderDiagnostic(
  source: string,
  diag: Diagnostic,
  hint?: string,
): string {
  const lineStarts = buildLineStarts(source);
  const lineStr = sliceLine(source, lineStarts, diag.line);
  const caretPad = ' '.repeat(Math.max(0, diag.column - 1));
  const underLine = '^' + (
    diag.length > 1
      ? '~'.repeat(Math.max(0, diag.length - 1))
      : '');
  const header = `${diag.name}: ${diag.message} (line ${diag.line}, column ${diag.column})`;
  const gutter = `${diag.line} |`;
  const body = `${gutter} ${lineStr}\n${' '.repeat(gutter.length)} ${caretPad}${underLine}${hint ? `\nHint: ${hint}` : ''}`;
  return `${header}\n${body}`;
}
