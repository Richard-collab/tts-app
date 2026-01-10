import { describe, it, expect } from 'vitest';
import { findMatchedCorpus, processCorpusData } from '../corpusUtils';

describe('findMatchedCorpus', () => {
    it('should match by exact name', () => {
        const group = { index: 'TestGroup', text: 'Some text' };
        const corpusList = [
            { index: 'OtherGroup', text: 'Other' },
            { index: 'TestGroup', text: 'Matched' }
        ];
        const match = findMatchedCorpus(group, corpusList);
        expect(match).toBeDefined();
        expect(match.index).toBe('TestGroup');
    });

    it('should match by baize ID', () => {
        const group = { index: 'Group1', text: 'Text', baizeData: { id: '123' } };
        const corpusList = [
            { index: 'Group2', baizeData: { id: '456' } },
            { index: 'Group3', baizeData: { id: '123' } }
        ];
        const match = findMatchedCorpus(group, corpusList);
        expect(match).toBeDefined();
        expect(match.index).toBe('Group3');
    });

    it('should match by baize target ID', () => {
        const group = { index: 'Group1', text: 'Text', baizeData: { id: 'target-1' } };
        const corpusList = [
            {
                index: 'Group2',
                baizeTargets: [{ id: 'target-1' }, { id: 'target-2' }]
            }
        ];
        const match = findMatchedCorpus(group, corpusList);
        expect(match).toBeDefined();
        expect(match.index).toBe('Group2');
    });

    it('should match by text content', () => {
        const group = { index: 'Group1', text: '你好世界' };
        const corpusList = [
            { index: 'Group2', text: '其他文本' },
            { index: 'Group3', text: '你好 世界 ' } // Should match normalized
        ];
        const match = findMatchedCorpus(group, corpusList);
        expect(match).toBeDefined();
        expect(match.index).toBe('Group3');
    });
});

describe('processCorpusData', () => {
    it('should return empty array for invalid input', () => {
        expect(processCorpusData(null)).toEqual([]);
        expect(processCorpusData([])).toEqual([]);
    });

    it('should aggregate items with same text content', () => {
        const rawData = [
            { id: '1', content: 'Same Text', contentName: 'A', audioStatus: '0' },
            { id: '2', content: 'Same Text', contentName: 'B', audioStatus: '1' },
            { id: '3', content: 'Other Text', contentName: 'C', audioStatus: '0' }
        ];

        const result = processCorpusData(rawData);
        expect(result).toHaveLength(2);

        const aggregated = result.find(r => r.text === 'Same Text');
        expect(aggregated).toBeDefined();
        expect(aggregated.index).toContain('A');
        expect(aggregated.index).toContain('B');
        expect(aggregated.baizeTargets).toHaveLength(2);

        // Status checks
        expect(aggregated.audioStatus).toBe('0'); // Mixed status -> 0 (Unverified)
        expect(aggregated.statusStats.verified).toBe(1);
        expect(aggregated.statusStats.unverified).toBe(1);
        expect(aggregated.statusStats.total).toBe(2);
    });

    it('should calculate verified status correctly', () => {
        const rawData = [
            { id: '1', content: 'Text', audioStatus: '1' },
            { id: '2', content: 'Text', audioStatus: '1' }
        ];
        const result = processCorpusData(rawData);
        expect(result[0].audioStatus).toBe('1');
    });

    it('should calculate marked status correctly', () => {
        const rawData = [
            { id: '1', content: 'Text', audioStatus: '2' },
            { id: '2', content: 'Text', audioStatus: '2' }
        ];
        const result = processCorpusData(rawData);
        expect(result[0].audioStatus).toBe('2');
    });
});
