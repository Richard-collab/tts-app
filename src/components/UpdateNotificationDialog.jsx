import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  FormControlLabel,
  Checkbox,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';

const UpdateNotificationDialog = ({ open, onClose, updateInfo }) => {
  const [doNotShowAgain, setDoNotShowAgain] = useState(true);

  if (!updateInfo) return null;

  const handleClose = () => {
    onClose(doNotShowAgain);
  };

  return (
    <Dialog
      open={open}
      onClose={(event, reason) => {
        // Prevent closing by clicking backdrop if we strictly want them to click the button
        // But usually standard dialogs allow backdrop click.
        // For this specific requirement "toggle box... default true",
        // if they click backdrop, we probably should treat it as "close without saving preference"
        // OR "close with current preference".
        // Let's stick to the button for explicit action, but allow backdrop close treating it as "Close" (triggering handleClose).
        if (reason !== 'backdropClick') {
             handleClose();
        }
      }}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <InfoIcon color="primary" />
        <Box>
            {updateInfo.title}
            <Typography variant="caption" display="block" color="text.secondary" sx={{ fontWeight: 'normal' }}>
                v{updateInfo.version} ({updateInfo.date})
            </Typography>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <List dense disablePadding>
          {updateInfo.content.map((item, index) => (
            <ListItem key={index} alignItems="flex-start" sx={{ pl: 0 }}>
               <ListItemIcon sx={{ minWidth: 24, mt: 0.8 }}>
                  <FiberManualRecordIcon sx={{ fontSize: 8 }} />
               </ListItemIcon>
               <ListItemText
                primary={item}
                primaryTypographyProps={{ variant: 'body1', style: { lineHeight: 1.6 } }}
               />
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'space-between', px: 3, py: 2 }}>
         <FormControlLabel
            control={
              <Checkbox
                checked={doNotShowAgain}
                onChange={(e) => setDoNotShowAgain(e.target.checked)}
                color="primary"
                size="small"
              />
            }
            label={<Typography variant="body2">本次更新不再提示</Typography>}
          />
        <Button onClick={handleClose} variant="contained" autoFocus>
          我知道了
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UpdateNotificationDialog;
