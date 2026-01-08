import { describe, it, expect } from 'vitest';
import { findMatchedCorpus } from '../corpusUtils';

describe('findMatchedCorpus', () => {
    const mockCorpusList = [
        {
            index: 'group-1',
            text: 'Hello World',
            baizeData: { id: 'bd-1', text: 'Hello World' },
            baizeTargets: [{ id: 'bd-1-t1' }]
        },
        {
            index: 'group-2',
            text: 'Test Text',
            baizeData: { id: 'bd-2', text: 'Test Text' }
        },
        {
            index: 'group-3',
            text: 'Normalized Test',
            baizeData: { id: 'bd-3', text: 'Normalized Test' }
        }
    ];

    it('matches by exact index', () => {
        const group = { index: 'group-1', text: 'Other Text' };
        const result = findMatchedCorpus(group, mockCorpusList);
        expect(result).toBe(mockCorpusList[0]);
    });

    it('matches by baizeData.id', () => {
        const group = { index: 'unknown', text: 'Other', baizeData: { id: 'bd-2' } };
        const result = findMatchedCorpus(group, mockCorpusList);
        expect(result).toBe(mockCorpusList[1]);
    });

    it('matches by baizeTargets id', () => {
        const group = { index: 'unknown', text: 'Other', baizeData: { id: 'bd-1-t1' } };
        const result = findMatchedCorpus(group, mockCorpusList);
        expect(result).toBe(mockCorpusList[0]);
    });

    it('matches by normalized text', () => {
        const group = { index: 'unknown', text: 'NormalizedTest' }; // spaces removed
        const result = findMatchedCorpus(group, mockCorpusList);
        expect(result).toBe(mockCorpusList[2]);
    });

     it('matches by normalized text from baizeData.text if available', () => {
        const group = { index: 'unknown', text: 'Wrong Text', baizeData: { text: 'Normalized Test' } };
        const result = findMatchedCorpus(group, mockCorpusList);
        expect(result).toBe(mockCorpusList[2]);
    });

    it('returns undefined if no match found', () => {
        const group = { index: 'nomatch', text: 'No Match' };
        const result = findMatchedCorpus(group, mockCorpusList);
        expect(result).toBeUndefined();
    });
});
