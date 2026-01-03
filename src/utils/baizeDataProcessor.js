/**
 * Processes script corpus data from Baize API.
 * Aggregates items with identical text content into a single entry.
 *
 * @param {Array} corpusData - The list of script unit contents from the API.
 * @returns {Array} - The prepared data list with aggregated items.
 */
export const processScriptCorpusData = (corpusData) => {
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
        const name = item.contentName || `导入语料-${idx + 1}`;
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
