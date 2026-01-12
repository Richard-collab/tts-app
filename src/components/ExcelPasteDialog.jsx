import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  TextField,
  DialogActions,
  Button
} from '@mui/material';
import { parseTSVContent } from '../utils/fileParser';

/**
 * ExcelPasteDialog Component
 *
 * A dialog that allows users to paste Excel/TSV content and parses it.
 *
 * @param {Object} props
 * @param {boolean} props.open - Whether the dialog is open
 * @param {function} props.onClose - Function to close the dialog
 * @param {function} props.onDataImported - Callback called with parsed data on success
 * @param {function} props.onError - Callback called with error object on failure
 */
const ExcelPasteDialog = ({ open, onClose, onDataImported, onError }) => {
  const [pasteContent, setPasteContent] = useState('');

  const handleConfirm = () => {
    try {
      const validData = parseTSVContent(pasteContent);
      onDataImported(validData);
      setPasteContent(''); // Clear on success
    } catch (error) {
      // Pass error to parent handler
      if (onError) {
        onError(error);
      } else {
        console.error("Paste import error:", error);
      }
    }
  };

  const handleClose = () => {
    setPasteContent(''); // Clear on cancel/close
    onClose();
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
          value={pasteContent}
          onChange={(e) => setPasteContent(e.target.value)}
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
