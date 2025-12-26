import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  TextField,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  Button,
  Typography
} from '@mui/material';

/**
 * Dialog component for searching and selecting a script from the Baize system.
 *
 * @param {Object} props - Component props
 * @param {boolean} props.open - Whether the dialog is open
 * @param {function} props.onClose - Handler for closing the dialog
 * @param {function} props.onConfirm - Handler for confirming the selection
 * @param {Array} props.scripts - List of script objects to display
 * @param {boolean} props.loading - Whether the scripts are currently loading
 * @param {string} props.searchTerm - Current search input value
 * @param {function} props.onSearchChange - Handler for search input changes
 * @param {Object} props.selectedScript - Currently selected script object
 * @param {function} props.onSelectScript - Handler for selecting a script
 * @param {boolean} props.syncTextEnabled - Value of the sync text checkbox
 * @param {function} props.onSyncTextChange - Handler for sync text checkbox changes
 */
const ScriptSelectionDialog = ({
  open,
  onClose,
  onConfirm,
  scripts,
  loading,
  searchTerm,
  onSearchChange,
  selectedScript,
  onSelectScript,
  syncTextEnabled,
  onSyncTextChange
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>选择话术导入</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2, mt: 1 }}>
          <TextField
            fullWidth
            size="small"
            label="搜索话术名称"
            value={searchTerm}
            onChange={onSearchChange}
            placeholder="输入关键词筛选..."
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={syncTextEnabled}
                onChange={onSyncTextChange}
              />
            }
            label="同步文本内容"
          />
        </Box>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <List sx={{ pt: 0, maxHeight: '400px', overflow: 'auto' }}>
            {scripts.filter(s => s.scriptName.toLowerCase().includes(searchTerm.toLowerCase())).length > 0 ? (
              scripts
                .filter(s => s.scriptName.toLowerCase().includes(searchTerm.toLowerCase()))
                .sort((a, b) => {
                  // Sort selected script to top if exists
                  if (selectedScript) {
                    if (a.id === selectedScript.id) return -1;
                    if (b.id === selectedScript.id) return 1;
                  }
                  return 0; // Keep original order otherwise
                })
                .map((script) => (
                  <Box key={script.id}>
                    <ListItem disablePadding>
                      <ListItemButton
                        onClick={() => onSelectScript(script)}
                        selected={selectedScript && selectedScript.id === script.id}
                      >
                        <ListItemText
                          primary={script.scriptName}
                          secondary={`ID: ${script.id} | Industry: ${script.primaryIndustry}`}
                        />
                      </ListItemButton>
                    </ListItem>
                    <Divider />
                  </Box>
                ))
            ) : (
              <Typography sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
                没有找到匹配的话术
              </Typography>
            )}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>取消</Button>
        <Button onClick={onConfirm} variant="contained" disabled={!selectedScript}>
          确定
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ScriptSelectionDialog;
