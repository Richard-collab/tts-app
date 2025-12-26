import { describe, it, expect } from 'vitest';
import { parseTSVContent } from '../fileParser';

describe('parseTSVContent', () => {
  it('should successfully parse valid TSV content', () => {
    const input = `语料名称\t文字内容
001\t你好
002\t世界`;
    const expected = [
      { index: '001', text: '你好' },
      { index: '002', text: '世界' }
    ];
    expect(parseTSVContent(input)).toEqual(expected);
  });

  it('should throw error when content is empty', () => {
    expect(() => parseTSVContent('')).toThrow('粘贴内容为空');
    expect(() => parseTSVContent('   ')).toThrow('粘贴内容为空');
  });

  it('should throw error when only header is present', () => {
    const input = `语料名称\t文字内容`;
    expect(() => parseTSVContent(input)).toThrow('粘贴内容必须包含表头和至少一行数据');
  });

  it('should throw error when headers are missing', () => {
    const input = `ID\tText
001\tHello`;
    expect(() => parseTSVContent(input)).toThrow('粘贴内容必须包含"语料名称"和"文字内容"列表头');
  });

  it('should throw error when one required header is missing', () => {
    const input = `语料名称\tOther
001\tHello`;
    expect(() => parseTSVContent(input)).toThrow('粘贴内容必须包含"语料名称"和"文字内容"列表头');
  });

  it('should skip rows with insufficient columns', () => {
    const input = `语料名称\t文字内容
001\t
002\t完整内容`;
    // Row 001 has empty text (split result might depend on implementation details of split, but trimmed check handles it)
    // Actually, split('\t') on "001\t" gives ["001", ""].
    // Logic: if (name && text) -> "" is falsy. So it should be skipped.

    const expected = [
      { index: '002', text: '完整内容' }
    ];
    expect(parseTSVContent(input)).toEqual(expected);
  });

  it('should throw error if no valid data found after parsing', () => {
    // We need content that survives .trim() (so non-whitespace)
    // but fails to produce valid name/text pairs.
    const input = `语料名称\t文字内容
InvalidRowData`;
    expect(() => parseTSVContent(input)).toThrow('粘贴内容中没有有效的文本数据');
  });

  it('should handle extra columns gracefully', () => {
    const input = `语料名称\t文字内容\t备注
001\t你好\tIgnored
002\t世界\tIgnored`;
    const expected = [
      { index: '001', text: '你好' },
      { index: '002', text: '世界' }
    ];
    expect(parseTSVContent(input)).toEqual(expected);
  });

  it('should handle different column orders', () => {
    const input = `文字内容\t语料名称
你好\t001
世界\t002`;
    const expected = [
      { index: '001', text: '你好' },
      { index: '002', text: '世界' }
    ];
    expect(parseTSVContent(input)).toEqual(expected);
  });
});
