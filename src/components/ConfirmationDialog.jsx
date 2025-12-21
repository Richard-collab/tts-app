import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button
} from '@mui/material';

function ConfirmationDialog({
  open,
  title,
  content,
  onConfirm,
  onClose,
  confirmLabel = '确认',
  cancelLabel = '取消',
  confirmColor = 'primary'
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">
        {title}
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          {content}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          {cancelLabel}
        </Button>
        <Button
          onClick={() => {
            onConfirm();
            onClose();
          }}
          color={confirmColor}
          variant="contained"
          autoFocus
        >
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ConfirmationDialog;
