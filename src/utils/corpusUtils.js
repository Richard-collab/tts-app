/**
 * Finds a matching corpus item for a given audio group.
 * @param {Object} group - The audio group object.
 * @param {Array} corpusList - The list of corpus items.
 * @returns {Object|undefined} The matching corpus item or undefined.
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
 * Aggregates raw corpus data by text content to handle fan-out uploads.
 * @param {Array} corpusData - The raw corpus data from the API.
 * @returns {Array} The prepared (aggregated) data list.
 */
export const processCorpusData = (corpusData) => {
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

        // Calculate aggregate status
        let countVerified = 0;
        let countMarked = 0;
        let countUnverified = 0;
        const totalItems = entry.items.length;

        entry.items.forEach(item => {
            const status = item.audioStatus || '0';
            if (status === '1') countVerified++;
            else if (status === '2') countMarked++;
            else countUnverified++;
        });

        let aggregatedStatus = '0';
        if (countVerified === totalItems) aggregatedStatus = '1';
        else if (countMarked === totalItems) aggregatedStatus = '2';

        return {
            index: combinedName,
            text: entry.text,
            corpusType: primary.corpusType || '',
            canvasName: primary.canvasName || '',
            audioStatus: aggregatedStatus,
            statusStats: {
                verified: countVerified,
                marked: countMarked,
                unverified: countUnverified,
                total: totalItems
            },
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
