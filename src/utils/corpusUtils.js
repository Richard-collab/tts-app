/**
 * Helper for finding matching corpus from a list based on group data.
 * Matches by Exact Name (index), ID (baizeData.id), or Normalized Text.
 *
 * @param {Object} group - The audio group object containing metadata (index, baizeData, text).
 * @param {Array<Object>} corpusList - The list of corpus items to search against.
 * @returns {Object|undefined} - The matched corpus item or undefined if not found.
 */
export const findMatchedCorpus = (group, corpusList) => {
  // 1. Exact Name Match
  let match = corpusList.find(c => c.index === group.index);
  if (match) return match;

  // 2. ID Match (if source has baize info)
  if (group.baizeData?.id) {
       match = corpusList.find(c => {
           if (c.baizeData?.id === group.baizeData.id) return true;
           if (c.baizeTargets?.some(t => t.id === group.baizeData.id)) return true;
           return false;
       });
       if (match) return match;
  }

  // 3. Text Match (Normalized)
  // Use original text from baizeData if available (to handle edited text case), otherwise current group text
  const textToMatch = group.baizeData?.text || group.text;
  if (textToMatch) {
      const normalizedSource = textToMatch.replace(/\s/g, '');
      match = corpusList.find(c => c.text && c.text.replace(/\s/g, '') === normalizedSource);
  }

  return match;
};
