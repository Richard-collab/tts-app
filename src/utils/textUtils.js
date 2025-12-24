/**
 * Helper functions for text manipulation and processing
 */

/**
 * Splits a text string into sentences based on punctuation (Chinese periods and question marks).
 * @param {string} text - The input text to split.
 * @returns {string[]} An array of sentence strings.
 */
export function splitTextIntoSentences(text) {
  if (!text) return [];

  // Split by Chinese period or question mark, capturing the delimiter
  const sentences = text.split(/([。？])/);
  const result = [];
  let currentSentence = '';

  for (let i = 0; i < sentences.length; i++) {
    if (sentences[i].trim() === '') continue;

    currentSentence += sentences[i];

    // If the current segment is a delimiter, complete the sentence
    if (sentences[i] === '。' || sentences[i] === '？') {
      result.push(currentSentence.trim());
      currentSentence = '';
    }
  }

  // Add any remaining text as the last sentence
  if (currentSentence.trim() !== '') {
    result.push(currentSentence.trim());
  }

  return result.filter(sentence => sentence.length > 0);
}
