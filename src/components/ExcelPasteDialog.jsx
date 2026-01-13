import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  TextField
} from '@mui/material';
import { parseTSVContent } from '../utils/fileParser';

/**
 * Dialog for pasting Excel/TSV data from clipboard.
 *
 * @param {Object} props
 * @param {boolean} props.open - Whether the dialog is open.
 * @param {function} props.onClose - Callback to close the dialog.
 * @param {function} props.onImport - Callback with parsed data array on success.
 * @param {function} props.onError - Callback with error object on failure.
 */
function ExcelPasteDialog({ open, onClose, onImport, onError }) {
  const [content, setContent] = useState('');

  // Reset content when dialog opens
  useEffect(() => {
    if (open) {
      setContent('');
    }
  }, [open]);

  const handleConfirm = () => {
    try {
      const validData = parseTSVContent(content);
      onImport(validData);
      onClose();
    } catch (error) {
      if (onError) {
        onError(error);
      } else {
        console.error('Paste import error:', error);
      }
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>从剪贴板粘贴数据</DialogTitle>
      <DialogContent>
        <Typography variant="body2" sx={{ mb: 2 }}>
          请从Excel中复制表格内容（包含表头"语料名称"和"文字内容"），并粘贴到下方文本框中。
        </Typography>
        <TextField
          autoFocus
          margin="dense"
          id="paste-content"
          label="粘贴区域"
          type="text"
          fullWidth
          multiline
          rows={10}
          variant="outlined"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={`语料名称\t文字内容\n001\t你好世界\n002\t测试文本`}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>取消</Button>
        <Button onClick={handleConfirm} variant="contained">确认导入</Button>
      </DialogActions>
    </Dialog>
  );
}

export default ExcelPasteDialog;
