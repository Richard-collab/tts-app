import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TtsControls from '../TtsControls';

// Mock the voiceOptions to have a stable test
vi.mock('../../constants/ttsConfig', () => ({
  voiceOptions: [
    { value: '', label: '请选择...' },
    { value: 'voice1', label: 'Voice 1' },
  ],
  speedOptions: [
    { value: '1.0', label: '1.0' },
    { value: '2.0', label: '2.0' },
  ],
  volumeOptions: [
    { value: '1.0', label: '1.0' },
  ],
  pitchOptions: [
    { value: '1.0', label: '1.0' },
  ],
}));

describe('TtsControls', () => {
  const defaultProps = {
    voice: '',
    setVoice: vi.fn(),
    speed: '1.0',
    setSpeed: vi.fn(),
    volume: '1.0',
    setVolume: vi.fn(),
    pitch: '1.0',
    setPitch: vi.fn(),
    splitOption: 'no',
    setSplitOption: vi.fn(),
  };

  it('renders all control labels', () => {
    render(<TtsControls {...defaultProps} />);
    // Use getAllByText because MUI might duplicate labels in fieldsets or aria-labels
    expect(screen.getAllByText(/音色选择/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/语速调节/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/音量控制/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/音调控制/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/文本分割/).length).toBeGreaterThan(0);
  });

  it('calls setVoice when a voice is selected', () => {
    render(<TtsControls {...defaultProps} />);

    // Find comboboxes by role
    const comboboxes = screen.getAllByRole('combobox');
    const voiceSelect = comboboxes[0];

    // Open the dropdown
    fireEvent.mouseDown(voiceSelect);

    // Find the option
    const option = screen.getByText('Voice 1');
    fireEvent.click(option);

    expect(defaultProps.setVoice).toHaveBeenCalledWith('voice1');
  });

  it('calls setSpeed when speed is changed', () => {
    render(<TtsControls {...defaultProps} />);
    const comboboxes = screen.getAllByRole('combobox');
    const speedSelect = comboboxes[1];

    // Open the dropdown
    fireEvent.mouseDown(speedSelect);

    // Find the option
    const option = screen.getByText('2.0');
    fireEvent.click(option);

    expect(defaultProps.setSpeed).toHaveBeenCalledWith('2.0');
  });
});
