import { fetchWithRetry } from './networkUtils';

/**
 * Generates audio for a single text segment using the TTS API.
 *
 * @param {string} text - The text to synthesize.
 * @param {string} voiceVal - The voice speaker name.
 * @param {string|number} speedVal - The speed of speech (e.g., "1.0").
 * @param {string|number} volumeVal - The volume level (e.g., "1.0").
 * @param {string|number} pitchVal - The pitch level (e.g., "1.0").
 * @returns {Promise<Blob>} - The generated audio as a Blob.
 */
export const generateSingleAudio = async (text, voiceVal, speedVal, volumeVal, pitchVal) => {
  const response = await fetchWithRetry('http://192.168.23.176:6789/synthesize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text,
      spk_name: voiceVal,
      speed: speedVal,
      volume: volumeVal,
      pitch: pitchVal
    })
  }, 3, 1000);
  return await response.blob();
};
