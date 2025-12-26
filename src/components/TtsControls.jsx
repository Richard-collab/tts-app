import React from 'react';
import {
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  voiceOptions,
  speedOptions,
  volumeOptions,
  pitchOptions
} from '../constants/ttsConfig';

/**
 * TtsControls Component
 *
 * Renders the configuration controls for TTS generation including:
 * - Voice selection
 * - Speed
 * - Volume
 * - Pitch
 * - Split option
 *
 * @param {Object} props
 * @param {string} props.voice - Selected voice value
 * @param {function} props.setVoice - Setter for voice
 * @param {string} props.speed - Selected speed value
 * @param {function} props.setSpeed - Setter for speed
 * @param {string} props.volume - Selected volume value
 * @param {function} props.setVolume - Setter for volume
 * @param {string} props.pitch - Selected pitch value
 * @param {function} props.setPitch - Setter for pitch
 * @param {string} props.splitOption - Selected split option value
 * @param {function} props.setSplitOption - Setter for split option
 */
const TtsControls = ({
  voice,
  setVoice,
  speed,
  setSpeed,
  volume,
  setVolume,
  pitch,
  setPitch,
  splitOption,
  setSplitOption
}) => {
  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <FormControl fullWidth size="small">
          <InputLabel>音色选择 <span style={{ color: 'red' }}>[请勿选错]</span></InputLabel>
          <Select
            value={voice}
            label="音色选择 [请勿选错]"
            onChange={(e) => setVoice(e.target.value)}
          >
            {voiceOptions.map(opt => (
              <MenuItem key={opt.value} value={opt.value} disabled={opt.value === ''}>
                {opt.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <FormControl fullWidth size="small">
          <InputLabel>语速调节</InputLabel>
          <Select value={speed} label="语速调节" onChange={(e) => setSpeed(e.target.value)}>
            {speedOptions.map(opt => (
              <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <FormControl fullWidth size="small">
          <InputLabel>音量控制</InputLabel>
          <Select value={volume} label="音量控制" onChange={(e) => setVolume(e.target.value)}>
            {volumeOptions.map(opt => (
              <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <FormControl fullWidth size="small">
          <InputLabel>音调控制</InputLabel>
          <Select value={pitch} label="音调控制" onChange={(e) => setPitch(e.target.value)}>
            {pitchOptions.map(opt => (
              <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <FormControl fullWidth size="small">
          <InputLabel>文本分割</InputLabel>
          <Select value={splitOption} label="文本分割" onChange={(e) => setSplitOption(e.target.value)}>
            <MenuItem value="yes">是（将按句号/问号分片）</MenuItem>
            <MenuItem value="no">否（将整段合成）</MenuItem>
          </Select>
        </FormControl>
      </Grid>
    </Grid>
  );
};

export default TtsControls;
