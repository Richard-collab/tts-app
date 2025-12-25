import { describe, it, expect } from 'vitest';
import { splitTextIntoSentences } from '../../utils/textUtils';

describe('splitTextIntoSentences', () => {
  it('should split text by Chinese period', () => {
    const text = '这是第一句。这是第二句。';
    const result = splitTextIntoSentences(text);
    expect(result).toEqual(['这是第一句。', '这是第二句。']);
  });

  it('should split text by Chinese question mark', () => {
    const text = '你好吗？我很好。';
    const result = splitTextIntoSentences(text);
    expect(result).toEqual(['你好吗？', '我很好。']);
  });

  it('should handle text without punctuation', () => {
    const text = '这是一段没有标点的文字';
    const result = splitTextIntoSentences(text);
    expect(result).toEqual(['这是一段没有标点的文字']);
  });

  it('should handle mixed punctuation', () => {
    const text = '真的吗？是的。太好了！';
    const result = splitTextIntoSentences(text);
    // Note: The function only splits on 。 and ？, so "太好了！" remains attached or separate?
    // Based on implementation: split by ([。？])
    // "真的吗？" -> "真的吗", "？"
    // "是的。" -> "是的", "。"
    // "太好了！" -> "太好了！"
    expect(result).toEqual(['真的吗？', '是的。', '太好了！']);
  });

  it('should handle empty string', () => {
    expect(splitTextIntoSentences('')).toEqual([]);
  });

  it('should ignore whitespace only segments', () => {
    const text = '   。  ';
    const result = splitTextIntoSentences(text);
    expect(result).toEqual(['。']);
  });
});
