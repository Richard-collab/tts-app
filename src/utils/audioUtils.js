/**
 * Helper functions for audio buffer manipulation operations
 * These functions are extracted to be testable independently of the UI components
 */

/**
 * Replace a selection in an audio buffer with clipboard content
 * @param {AudioBuffer} sourceBuffer - The source audio buffer
 * @param {AudioBuffer} clipboardBuffer - The clipboard buffer to insert
 * @param {number} selectionStartSample - Selection start in samples
 * @param {number} selectionEndSample - Selection end in samples
 * @param {AudioContext} audioContext - AudioContext for creating new buffer
 * @returns {AudioBuffer} New buffer with selection replaced
 */
export function replaceSelection(
  sourceBuffer,
  clipboardBuffer,
  selectionStartSample,
  selectionEndSample,
  audioContext
) {
  // Validate inputs
  if (!clipboardBuffer || clipboardBuffer.numberOfChannels <= 0) {
    throw new Error('Invalid clipboard buffer: must have at least one channel');
  }
  if (selectionStartSample < 0 || selectionEndSample > sourceBuffer.length || selectionStartSample >= selectionEndSample) {
    throw new Error('Invalid selection range');
  }

  const selectionLength = selectionEndSample - selectionStartSample;
  const newLength = sourceBuffer.length - selectionLength + clipboardBuffer.length;
  
  const newBuffer = audioContext.createBuffer(
    sourceBuffer.numberOfChannels,
    newLength,
    sourceBuffer.sampleRate
  );

  for (let channel = 0; channel < sourceBuffer.numberOfChannels; channel++) {
    const sourceData = sourceBuffer.getChannelData(channel);
    const clipboardData = clipboardBuffer.getChannelData(channel % clipboardBuffer.numberOfChannels);
    const newData = newBuffer.getChannelData(channel);

    // Copy before selection
    for (let i = 0; i < selectionStartSample; i++) {
      newData[i] = sourceData[i];
    }

    // Insert clipboard content
    for (let i = 0; i < clipboardBuffer.length; i++) {
      newData[selectionStartSample + i] = clipboardData[i];
    }

    // Copy after selection
    for (let i = selectionEndSample; i < sourceBuffer.length; i++) {
      newData[i - selectionLength + clipboardBuffer.length] = sourceData[i];
    }
  }

  return newBuffer;
}

/**
 * Insert clipboard content at a specific position in an audio buffer
 * @param {AudioBuffer} sourceBuffer - The source audio buffer
 * @param {AudioBuffer} clipboardBuffer - The clipboard buffer to insert
 * @param {number} insertPositionSample - Insert position in samples
 * @param {AudioContext} audioContext - AudioContext for creating new buffer
 * @returns {AudioBuffer} New buffer with clipboard inserted
 */
export function insertAtPosition(
  sourceBuffer,
  clipboardBuffer,
  insertPositionSample,
  audioContext
) {
  // Validate inputs
  if (!clipboardBuffer || clipboardBuffer.numberOfChannels <= 0) {
    throw new Error('Invalid clipboard buffer: must have at least one channel');
  }
  if (insertPositionSample < 0 || insertPositionSample > sourceBuffer.length) {
    throw new Error('Invalid insert position');
  }

  const newLength = sourceBuffer.length + clipboardBuffer.length;
  
  const newBuffer = audioContext.createBuffer(
    sourceBuffer.numberOfChannels,
    newLength,
    sourceBuffer.sampleRate
  );

  for (let channel = 0; channel < sourceBuffer.numberOfChannels; channel++) {
    const sourceData = sourceBuffer.getChannelData(channel);
    const clipboardData = clipboardBuffer.getChannelData(channel % clipboardBuffer.numberOfChannels);
    const newData = newBuffer.getChannelData(channel);

    // Copy before insertion point
    for (let i = 0; i < insertPositionSample; i++) {
      newData[i] = sourceData[i];
    }

    // Insert clipboard
    for (let i = 0; i < clipboardBuffer.length; i++) {
      newData[insertPositionSample + i] = clipboardData[i];
    }

    // Copy after insertion point
    for (let i = insertPositionSample; i < sourceBuffer.length; i++) {
      newData[i + clipboardBuffer.length] = sourceData[i];
    }
  }

  return newBuffer;
}

/**
 * Convert AudioBuffer to WAV Blob
 * @param {AudioBuffer} abuffer - The AudioBuffer to convert
 * @param {number} len - The length to convert
 * @returns {Blob} The WAV Blob
 */
export function bufferToWave(abuffer, len) {
  const numOfChan = abuffer.numberOfChannels;
  const length = len * numOfChan * 2;
  const buffer = new ArrayBuffer(44 + length);
  const view = new DataView(buffer);
  const channels = [];
  let i, sample;
  let offset = 0;
  let pos = 0;

  const setUint16 = (data) => { view.setUint16(offset, data, true); offset += 2; };
  const setUint32 = (data) => { view.setUint32(offset, data, true); offset += 4; };

  setUint32(0x46464952);
  setUint32(length + 36);
  setUint32(0x45564157);
  setUint32(0x20746d66);
  setUint32(16);
  setUint16(1);
  setUint16(numOfChan);
  setUint32(abuffer.sampleRate);
  setUint32(abuffer.sampleRate * 2 * numOfChan);
  setUint16(numOfChan * 2);
  setUint16(16);
  setUint32(0x61746164);
  setUint32(length);

  for (i = 0; i < abuffer.numberOfChannels; i++) {
    channels.push(abuffer.getChannelData(i));
  }

  while (pos < len) {
    for (i = 0; i < numOfChan; i++) {
      sample = Math.max(-1, Math.min(1, channels[i][pos]));
      sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
      view.setInt16(offset, sample, true);
      offset += 2;
    }
    pos++;
  }
  return new Blob([buffer], { type: "audio/wav" });
}

/**
 * Merge multiple AudioBuffers into one WAV Blob
 * @param {AudioContext} audioContext - The AudioContext
 * @param {Array<AudioBuffer>} audioBuffers - List of AudioBuffers to merge
 * @returns {Blob} The merged WAV Blob
 */
export function mergeBuffers(audioContext, audioBuffers) {
  let totalLength = 0;
  audioBuffers.forEach(buffer => {
    if (buffer) totalLength += buffer.length;
  });

  const mergedBuffer = audioContext.createBuffer(
    audioBuffers[0] ? audioBuffers[0].numberOfChannels : 1,
    totalLength,
    audioBuffers[0] ? audioBuffers[0].sampleRate : 44100
  );

  let offset = 0;
  for (let i = 0; i < audioBuffers.length; i++) {
    if (audioBuffers[i]) {
      for (let channel = 0; channel < mergedBuffer.numberOfChannels; channel++) {
        const channelData = mergedBuffer.getChannelData(channel);
        const sourceData = audioBuffers[i].getChannelData(
          channel < audioBuffers[i].numberOfChannels ? channel : 0
        );
        channelData.set(sourceData, offset);
      }
      offset += audioBuffers[i].length;
    }
  }
  return bufferToWave(mergedBuffer, mergedBuffer.length);
}
