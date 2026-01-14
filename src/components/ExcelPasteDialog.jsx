import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Typography
} from '@mui/material';
import { parseTSVContent } from '../utils/fileParser';

/**
 * Dialog for pasting Excel content from clipboard.
 *
 * @param {Object} props
 * @param {boolean} props.open - Whether the dialog is open.
 * @param {function} props.onClose - Callback to close the dialog.
 * @param {function} props.onImport - Callback with parsed data (array of objects).
 * @param {function} props.onError - Callback with error object or message.
 */
const ExcelPasteDialog = ({ open, onClose, onImport, onError }) => {
  const [pasteContent, setPasteContent] = useState('');

  const handlePasteConfirm = () => {
    try {
      const validData = parseTSVContent(pasteContent);
      onImport(validData);
      setPasteContent(''); // Reset on success
    } catch (error) {
      if (onError) {
        onError(error);
      }
    }
  };

  const handleClose = () => {
      setPasteContent('');
      onClose();
  }

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
          value={pasteContent}
          onChange={(e) => setPasteContent(e.target.value)}
          placeholder={`语料名称\t文字内容\n001\t你好世界\n002\t测试文本`}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>取消</Button>
        <Button onClick={handlePasteConfirm} variant="contained">确认导入</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExcelPasteDialog;
