import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TtsControls from '../TtsControls';
import { vi } from 'vitest';

describe('TtsControls', () => {
  const mockProps = {
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

  it('renders all controls', () => {
    render(<TtsControls {...mockProps} />);

    // MUI renders labels and sometimes hidden inputs.
    // For "音色选择", it appears twice (label + legend). getAllByText is safer.
    expect(screen.getAllByText(/音色选择/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/语速调节/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/音量控制/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/音调控制/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/文本分割/i).length).toBeGreaterThan(0);
  });

  it('calls setVoice when voice changes', async () => {
    const user = userEvent.setup();
    render(<TtsControls {...mockProps} />);

    const voiceSelect = screen.getAllByRole('combobox')[0]; // First one is voice
    await user.click(voiceSelect);

    // Select an option
    const option = await screen.findByRole('option', { name: 'LAX音色-阿里' });
    await user.click(option);

    expect(mockProps.setVoice).toHaveBeenCalled();
  });

  it('calls setSpeed when speed changes', async () => {
    const user = userEvent.setup();
    render(<TtsControls {...mockProps} />);

    // Speed is the second select
    const speedSelect = screen.getAllByRole('combobox')[1];
    await user.click(speedSelect);

    const option = await screen.findByRole('option', { name: '1.5 (很快)' });
    await user.click(option);

    expect(mockProps.setSpeed).toHaveBeenCalled();
  });
});
