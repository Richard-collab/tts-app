/**
 * Helper for finding matching corpus in a list.
 * Matches by Exact Index Name, Baize ID, or Text Content.
 *
 * @param {Object} group - The audio group object to match.
 * @param {Array} corpusList - The list of corpus items to search in.
 * @returns {Object|undefined} The matched corpus item or undefined.
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

/**
 * Aggregates raw corpus data from Baize API into a structured format for the editor.
 * Groups items by text content.
 *
 * @param {Array} corpusData - Raw array of corpus items from API (scriptUnitContents).
 * @returns {Array} Array of aggregated corpus objects ready for the editor.
 */
export const aggregateCorpusData = (corpusData) => {
    if (!corpusData || !Array.isArray(corpusData)) {
        return [];
    }

    // Aggregation by text content
    const aggregationMap = new Map();
    corpusData.forEach((item, idx) => {
        const text = item.content;
        if (!text) return;

        if (!aggregationMap.has(text)) {
            aggregationMap.set(text, {
                text: text,
                names: [],
                items: [],
                primaryItem: item,
                firstIdx: idx
            });
        }

        const entry = aggregationMap.get(text);
        const name = item.contentName || `导入语料-${idx+1}`;
        entry.names.push(name);
        entry.items.push(item);
    });

    const preparedData = Array.from(aggregationMap.values()).map((entry) => {
        const combinedName = entry.names.join('&');
        const primary = entry.primaryItem;

        return {
            index: combinedName,
            text: entry.text,
            corpusType: primary.corpusType || '',
            canvasName: primary.canvasName || '',
            audioStatus: primary.audioStatus || '0',
            audioPath: primary.audioPath || '',
            baizeData: {
                id: primary.id,
                corpusId: primary.corpusId,
                text: entry.text,
                originalData: primary
            },
            baizeTargets: entry.items.map(item => ({
                id: item.id,
                corpusId: item.corpusId,
                text: item.content,
                originalData: item
            })),
            uniqueId: primary.id || entry.firstIdx
        };
    });

    return preparedData;
};
