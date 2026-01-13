import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ExcelPasteDialog from '../ExcelPasteDialog';

// Mock the parseTSVContent utility
vi.mock('../../utils/fileParser', () => ({
  parseTSVContent: vi.fn((content) => {
    if (content === 'valid') {
      return [{ index: '001', text: 'test' }];
    }
    throw new Error('Invalid content');
  }),
}));

describe('ExcelPasteDialog', () => {
  it('renders correctly when open', () => {
    render(<ExcelPasteDialog open={true} onClose={() => {}} onImport={() => {}} />);
    expect(screen.getByText('从剪贴板粘贴数据')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /粘贴区域/i })).toBeInTheDocument();
  });

  it('calls onClose when Cancel is clicked', () => {
    const onClose = vi.fn();
    render(<ExcelPasteDialog open={true} onClose={onClose} onImport={() => {}} />);
    fireEvent.click(screen.getByText('取消'));
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onImport with data when Confirm is clicked with valid content', async () => {
    const onImport = vi.fn();
    const onClose = vi.fn();
    render(<ExcelPasteDialog open={true} onClose={onClose} onImport={onImport} />);

    const input = screen.getByRole('textbox', { name: /粘贴区域/i });
    fireEvent.change(input, { target: { value: 'valid' } });
    fireEvent.click(screen.getByText('确认导入'));

    expect(onImport).toHaveBeenCalledWith([{ index: '001', text: 'test' }]);
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onError when Confirm is clicked with invalid content', () => {
    const onImport = vi.fn();
    const onError = vi.fn();
    render(<ExcelPasteDialog open={true} onClose={() => {}} onImport={onImport} onError={onError} />);

    const input = screen.getByRole('textbox', { name: /粘贴区域/i });
    fireEvent.change(input, { target: { value: 'invalid' } });
    fireEvent.click(screen.getByText('确认导入'));

    expect(onImport).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalled();
  });
});
