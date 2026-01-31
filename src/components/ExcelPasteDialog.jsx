import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography
} from '@mui/material';
import { parseTSVContent } from '../utils/fileParser';
import { logAction, ActionTypes } from '../utils/logger';

/**
 * Dialog component for pasting Excel/TSV content from clipboard.
 *
 * @param {Object} props
 * @param {boolean} props.open - Whether the dialog is open.
 * @param {function} props.onClose - Callback to close the dialog.
 * @param {function(Array)} props.onImport - Callback called with parsed data on success.
 * @param {function(string)} props.onError - Callback called with error message on failure.
 */
function ExcelPasteDialog({ open, onClose, onImport, onError }) {
  const [pasteContent, setPasteContent] = useState('');

  const handleClose = () => {
    setPasteContent('');
    onClose();
  };

  const handleConfirm = () => {
    try {
      const validData = parseTSVContent(pasteContent);

      logAction(ActionTypes.IMPORT_PASTE, { count: validData.length }, 'success');

      if (onImport) {
        onImport(validData);
      }

      handleClose();
    } catch (error) {
      logAction(ActionTypes.IMPORT_PASTE, { error: error.message }, 'error');

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
}

export default ExcelPasteDialog;
