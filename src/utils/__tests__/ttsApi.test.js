import { describe, it, expect, vi } from 'vitest';
import { generateSingleAudio } from '../ttsApi';
import { fetchWithRetry } from '../networkUtils';

// Mock the networkUtils module
vi.mock('../networkUtils', () => ({
  fetchWithRetry: vi.fn(),
}));

describe('generateSingleAudio', () => {
  it('should call fetchWithRetry with correct parameters and return a blob', async () => {
    const mockBlob = new Blob(['audio data'], { type: 'audio/wav' });
    const mockResponse = {
      blob: vi.fn().mockResolvedValue(mockBlob),
    };
    fetchWithRetry.mockResolvedValue(mockResponse);

    const text = 'Hello';
    const voice = 'voice1';
    const speed = '1.0';
    const volume = '1.0';
    const pitch = '1.0';

    const result = await generateSingleAudio(text, voice, speed, volume, pitch);

    expect(fetchWithRetry).toHaveBeenCalledWith(
      'http://192.168.23.176:6789/synthesize',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          spk_name: voice,
          speed,
          volume,
          pitch
        })
      },
      3,
      1000
    );

    expect(result).toBe(mockBlob);
  });

  it('should throw error if fetchWithRetry fails', async () => {
    const error = new Error('Network error');
    fetchWithRetry.mockRejectedValue(error);

    await expect(generateSingleAudio('text', 'voice', '1', '1', '1')).rejects.toThrow('Network error');
  });
});
