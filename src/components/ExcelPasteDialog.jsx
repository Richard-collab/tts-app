import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, Typography, TextField, DialogActions, Button } from '@mui/material';
import { parseTSVContent } from '../utils/fileParser';

/**
 * Dialog for pasting Excel content (TSV format) from clipboard.
 *
 * @param {Object} props
 * @param {boolean} props.open - Whether the dialog is open.
 * @param {Function} props.onClose - Callback to close the dialog.
 * @param {Function} props.onImport - Callback with parsed data on success.
 * @param {Function} props.onError - Callback with error message on failure.
 */
const ExcelPasteDialog = ({ open, onClose, onImport, onError }) => {
  const [content, setContent] = useState('');

  const handleClose = () => {
    setContent('');
    onClose();
  };

  const handleConfirm = () => {
    try {
      const validData = parseTSVContent(content);
      onImport(validData);
      handleClose();
    } catch (error) {
      if (onError) {
        onError(error.message);
      }
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
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
        <Button onClick={handleClose}>取消</Button>
        <Button onClick={handleConfirm} variant="contained">确认导入</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExcelPasteDialog;
