import { describe, it, expect } from 'vitest';
import { findMatchedCorpus, aggregateCorpusData } from '../corpusUtils';

describe('corpusUtils', () => {
    describe('findMatchedCorpus', () => {
        const corpusList = [
            { index: 'Group1', text: 'Text 1', baizeData: { id: 'bd1' } },
            { index: 'Group2', text: 'Text 2', baizeData: { id: 'bd2' } },
            { index: 'Group3', text: 'Text 3', baizeData: { id: 'bd3' } },
            { index: 'Group4', text: 'Text 4', baizeData: { id: 'bd4' }, baizeTargets: [{ id: 'target1' }] }
        ];

        it('should match by exact index', () => {
            const group = { index: 'Group2', text: 'Other Text' };
            const match = findMatchedCorpus(group, corpusList);
            expect(match).toEqual(corpusList[1]);
        });

        it('should match by baizeData ID', () => {
            const group = { index: 'New Name', text: 'Text 1', baizeData: { id: 'bd3' } };
            const match = findMatchedCorpus(group, corpusList);
            expect(match).toEqual(corpusList[2]);
        });

        it('should match by baizeTargets ID', () => {
            const group = { index: 'New Name', text: 'Text 4', baizeData: { id: 'target1' } };
            const match = findMatchedCorpus(group, corpusList);
            expect(match).toEqual(corpusList[3]);
        });

        it('should match by normalized text', () => {
            const group = { index: 'New Name', text: '  Text   1  ' };
            const match = findMatchedCorpus(group, corpusList);
            expect(match).toEqual(corpusList[0]);
        });

        it('should return undefined if no match found', () => {
             const group = { index: 'Unknown', text: 'Unknown' };
             const match = findMatchedCorpus(group, corpusList);
             expect(match).toBeUndefined();
        });
    });

    describe('aggregateCorpusData', () => {
        it('should aggregate items with same content', () => {
            const rawData = [
                { id: 1, content: 'Hello', contentName: 'G1', corpusId: 101 },
                { id: 2, content: 'Hello', contentName: 'G2', corpusId: 102 },
                { id: 3, content: 'World', contentName: 'G3', corpusId: 103 }
            ];

            const result = aggregateCorpusData(rawData);

            expect(result).toHaveLength(2);

            // Check 'Hello' group
            const helloGroup = result.find(r => r.text === 'Hello');
            expect(helloGroup).toBeDefined();
            expect(helloGroup.index).toBe('G1&G2');
            expect(helloGroup.baizeTargets).toHaveLength(2);
            expect(helloGroup.baizeTargets[0].id).toBe(1);
            expect(helloGroup.baizeTargets[1].id).toBe(2);

            // Check 'World' group
            const worldGroup = result.find(r => r.text === 'World');
            expect(worldGroup).toBeDefined();
            expect(worldGroup.index).toBe('G3');
            expect(worldGroup.baizeTargets).toHaveLength(1);
        });

        it('should handle empty input', () => {
            expect(aggregateCorpusData(null)).toEqual([]);
            expect(aggregateCorpusData([])).toEqual([]);
        });
    });
});
