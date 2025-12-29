import { describe, it, expect } from 'vitest';
import { parseTSVContent } from '../fileParser';

describe('parseTSVContent', () => {
  it('should aggregate rows with identical text content', () => {
    const tsv = `语料名称\t文字内容
A\tHello World
B\tHello World
C\tOther Text`;

    const result = parseTSVContent(tsv);

    // Expect 2 entries: "A&B" (Hello World) and "C" (Other Text)
    // The set iteration order usually follows insertion, so likely "A&B" or "B&A" depending on implementation,
    // but here A comes first.

    expect(result).toHaveLength(2);

    const helloEntry = result.find(r => r.text === 'Hello World');
    expect(helloEntry).toBeDefined();
    // Names should be joined. Check for both possibilities just in case, but usually A&B.
    expect(['A&B', 'B&A']).toContain(helloEntry.index);

    const otherEntry = result.find(r => r.text === 'Other Text');
    expect(otherEntry).toBeDefined();
    expect(otherEntry.index).toBe('C');
  });

  it('should handle pre-combined names correctly', () => {
    const tsv = `语料名称\t文字内容
A&B\tHello World
C\tHello World`;

    const result = parseTSVContent(tsv);

    expect(result).toHaveLength(1);
    const entry = result[0];
    expect(entry.text).toBe('Hello World');
    // Set logic should dedup if overlap, but here distinct. A, B, C.
    // Order: A, B, C
    expect(['A&B&C', 'A&C&B', 'C&A&B']).toContain(entry.index);
  });

  it('should handle whitespace variations in text (trimming)', () => {
    const tsv = `语料名称\t文字内容
A\t  Hello World
B\tHello World`;

    const result = parseTSVContent(tsv);

    expect(result).toHaveLength(1);
    expect(result[0].index).toContain('&');
    expect(result[0].text).toBe('Hello World'); // Parsed text is trimmed
  });
});
