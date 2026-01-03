import { describe, it, expect } from 'vitest';
import { processScriptCorpusData } from '../baizeDataProcessor';

describe('processScriptCorpusData', () => {
    it('should return empty array for null or invalid input', () => {
        expect(processScriptCorpusData(null)).toEqual([]);
        expect(processScriptCorpusData(undefined)).toEqual([]);
        expect(processScriptCorpusData({})).toEqual([]);
    });

    it('should process simple corpus data correctly', () => {
        const input = [
            {
                id: '1',
                content: 'Hello',
                contentName: 'Start',
                corpusType: 'MASTER',
                canvasName: 'Flow1',
                audioStatus: '1',
                audioPath: 'path/to/audio',
                corpusId: 'c1'
            }
        ];

        const result = processScriptCorpusData(input);
        expect(result).toHaveLength(1);
        expect(result[0].text).toBe('Hello');
        expect(result[0].index).toBe('Start');
        expect(result[0].baizeData.id).toBe('1');
        expect(result[0].baizeTargets).toHaveLength(1);
    });

    it('should aggregate items with identical text', () => {
        const input = [
            {
                id: '1',
                content: 'Hello',
                contentName: 'Start',
                corpusId: 'c1'
            },
            {
                id: '2',
                content: 'Hello',
                contentName: 'Start2',
                corpusId: 'c2'
            },
            {
                id: '3',
                content: 'World',
                contentName: 'End',
                corpusId: 'c3'
            }
        ];

        const result = processScriptCorpusData(input);
        expect(result).toHaveLength(2);

        // Check "Hello" aggregation
        const helloEntry = result.find(r => r.text === 'Hello');
        expect(helloEntry).toBeDefined();
        expect(helloEntry.index).toBe('Start&Start2');
        expect(helloEntry.baizeTargets).toHaveLength(2);
        expect(helloEntry.baizeTargets[0].id).toBe('1');
        expect(helloEntry.baizeTargets[1].id).toBe('2');

        // Check "World"
        const worldEntry = result.find(r => r.text === 'World');
        expect(worldEntry).toBeDefined();
        expect(worldEntry.index).toBe('End');
        expect(worldEntry.baizeTargets).toHaveLength(1);
    });

    it('should skip items without text content', () => {
        const input = [
            { id: '1', content: '' },
            { id: '2', content: null },
            { id: '3', content: 'Valid' }
        ];

        const result = processScriptCorpusData(input);
        expect(result).toHaveLength(1);
        expect(result[0].text).toBe('Valid');
    });

    it('should handle missing contentName', () => {
        const input = [
            { id: '1', content: 'Test' }
        ];

        const result = processScriptCorpusData(input);
        expect(result[0].index).toMatch(/导入语料-1/);
    });
});
