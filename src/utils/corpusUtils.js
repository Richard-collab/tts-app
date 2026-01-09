/**
 * Helper for finding matching corpus in a list based on group data.
 * Matches by:
 * 1. Exact Index Name
 * 2. Baize ID (checking main ID and targets)
 * 3. Text Content (Normalized)
 *
 * @param {Object} group - The audio group object to match.
 * @param {Array} corpusList - The list of corpus items to search in.
 * @returns {Object|undefined} The matched corpus item or undefined if not found.
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
