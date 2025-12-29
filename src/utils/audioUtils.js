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
 * Converts an AudioBuffer to a WAV Blob
 * @param {AudioBuffer} abuffer - The audio buffer to convert
 * @param {number} len - Length of the buffer in samples
 * @returns {Blob} The WAV file blob
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
 * Merges multiple AudioBuffers into a single WAV Blob
 * @param {AudioContext} audioContext - The audio context
 * @param {AudioBuffer[]} audioBuffers - Array of audio buffers to merge
 * @returns {Blob} The merged WAV blob
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

/**
 * Merges an array of audio segments (blobs) into a single WAV Blob.
 *
 * @param {Array<{blob: Blob}>} audioSegments - Array of audio segments containing blobs
 * @returns {Promise<Blob>} A promise that resolves to the merged WAV Blob
 */
/**
 * Time stretch an audio buffer while preserving pitch
 * Uses a basic Overlap-Add (OLA) algorithm
 * @param {AudioBuffer} buffer - The source audio buffer
 * @param {number} speed - Speed ratio (e.g., 1.05 for 5% faster)
 * @param {AudioContext} audioContext - AudioContext for creating new buffer
 * @returns {AudioBuffer} New time-stretched audio buffer
 */
export function timeStretch(buffer, speed, audioContext) {
  const channels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const length = buffer.length;
  const newLength = Math.floor(length / speed);

  const newBuffer = audioContext.createBuffer(channels, newLength, sampleRate);

  const windowSize = 2048; // Adjust based on sample rate if needed
  const overlap = windowSize / 2;
  const hs = overlap; // Synthesis Hop (constant step in output)
  const ha = hs * speed; // Analysis Hop (variable step in input)

  // Create Hanning window
  const win = new Float32Array(windowSize);
  for (let i = 0; i < windowSize; i++) {
    win[i] = 0.5 * (1 - Math.cos(2 * Math.PI * i / windowSize));
  }

  for (let c = 0; c < channels; c++) {
    const inputData = buffer.getChannelData(c);
    const outputData = newBuffer.getChannelData(c);

    // We iterate output positions
    let analysisPos = 0;
    let synthesisPos = 0;

    while (synthesisPos + windowSize < newLength && analysisPos + windowSize < length) {
      // Add windowed segment to output
      for (let i = 0; i < windowSize; i++) {
        // Use nearest neighbor for analysis position (Math.floor)
        // OLA requires accumulating values
        outputData[synthesisPos + i] += inputData[Math.floor(analysisPos) + i] * win[i];
      }

      analysisPos += ha;
      synthesisPos += hs;
    }
  }

  return newBuffer;
}

export async function mergeAudioSegments(audioSegments) {
  return new Promise((resolve, reject) => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 8000 });
      const audioBuffers = [];
      let buffersLoaded = 0;

      if (audioSegments.length === 0) {
        resolve(null);
        return;
      }

      audioSegments.forEach((segment, index) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          audioContext.decodeAudioData(e.target.result, (buffer) => {
            audioBuffers[index] = buffer;
            buffersLoaded++;
            if (buffersLoaded === audioSegments.length) {
              try {
                const wavBlob = mergeBuffers(audioContext, audioBuffers);
                resolve(wavBlob);
              } catch (err) {
                reject(err);
              }
            }
          }, (err) => {
            console.error('Error decoding audio data', err);
            // Even if one fails, we might want to continue or fail.
            // Original logic continued but didn't handle the error case well in the callback (it just called mergeBuffers anyway).
            // We'll mimic the original logic which incremented buffersLoaded.
            buffersLoaded++;
            if (buffersLoaded === audioSegments.length) {
               try {
                const wavBlob = mergeBuffers(audioContext, audioBuffers);
                resolve(wavBlob);
              } catch (err) {
                reject(err);
              }
            }
          });
        };
        reader.onerror = (err) => reject(err);
        reader.readAsArrayBuffer(segment.blob);
      });
    } catch (error) {
      reject(error);
    }
  });
}
