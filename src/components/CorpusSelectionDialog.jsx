import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Typography, Grid, TextField, FormControl, InputLabel,
  Select, MenuItem, Button, List, ListItem, ListItemButton,
  ListItemIcon, ListItemText, Checkbox, Chip, Divider
} from '@mui/material';

/**
 * CorpusSelectionInner
 *
 * Internal component that holds the state for the dialog.
 * By separating this, we ensure that the state (filters, selection) is reset
 * automatically whenever the Dialog is re-opened (re-mounted),
 * without needing manual useEffect resets.
 */
const CorpusSelectionInner = ({ onConfirm, corpusList, scriptName, onClose }) => {
  // Filter State
  const [filterCorpusName, setFilterCorpusName] = useState('');
  const [filterTextContent, setFilterTextContent] = useState('');
  const [filterProcessFlow, setFilterProcessFlow] = useState('');
  const [filterCorpusType, setFilterCorpusType] = useState('全部');
  const [filterAuditStatus, setFilterAuditStatus] = useState('全部');

  // Selection State
  const [selectedCorpusIndices, setSelectedCorpusIndices] = useState(new Set());

  // Handler for toggling individual item selection
  const handleCorpusToggle = (id) => {
    const newSelected = new Set(selectedCorpusIndices);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedCorpusIndices(newSelected);
  };

  // Compute filtered list
  const filteredCorpus = corpusList.filter(item => {
    // 1. Corpus Name Match
    const nameMatch = !filterCorpusName || item.index.toLowerCase().includes(filterCorpusName.toLowerCase());

    // 2. Text Content Match
    const textMatch = !filterTextContent || item.text.toLowerCase().includes(filterTextContent.toLowerCase());

    // 3. Process Flow Match
    const flowMatch = !filterProcessFlow || item.canvasName.toLowerCase().includes(filterProcessFlow.toLowerCase());

    // 4. Corpus Type Match
    let typeMatch = false;
    const cType = item.corpusType || '';
    if (filterCorpusType === '全部') {
      typeMatch = true;
    } else if (filterCorpusType === '主流程') {
      typeMatch = cType.startsWith('MASTER_');
    } else if (filterCorpusType === '知识库') {
      typeMatch = cType.startsWith('KNOWLEDGE_');
    } else if (filterCorpusType === '功能话术') {
      typeMatch = cType.startsWith('FUNC_') || cType.startsWith('PRE_');
    }

    // 5. Audit Status Match
    let statusMatch = false;
    const aStatus = item.audioStatus; // '0', '1', '2'
    if (filterAuditStatus === '全部') {
      statusMatch = true;
    } else if (filterAuditStatus === '未验听') {
      statusMatch = aStatus === '0';
    } else if (filterAuditStatus === '已验听') {
      statusMatch = aStatus === '1';
    } else if (filterAuditStatus === '已标记') {
      statusMatch = aStatus === '2';
    }

    return nameMatch && textMatch && flowMatch && typeMatch && statusMatch;
  });

  const handleSelectCurrent = () => {
    const newSelected = new Set(selectedCorpusIndices);
    filteredCorpus.forEach(item => newSelected.add(item.uniqueId));
    setSelectedCorpusIndices(newSelected);
  };

  const handleClearAll = () => {
    setSelectedCorpusIndices(new Set());
  };

  const handleConfirm = () => {
    const selectedItems = corpusList.filter(item => selectedCorpusIndices.has(item.uniqueId));
    if (selectedItems.length === 0) {
      alert("请至少选择一条语料");
      return;
    }
    onConfirm(selectedItems);
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case '0': return '未验听';
      case '1': return '已验听';
      case '2': return '已标记';
      default: return '未知';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case '0': return 'default';
      case '1': return 'success';
      case '2': return 'error';
      default: return 'default';
    }
  };

  return (
    <>
      <DialogTitle>选择语料</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2, mt: 1 }}>
          <Typography variant="body2" sx={{ mb: 2 }}>
            当前话术: {scriptName}
          </Typography>

          {/* Filters */}
          <Grid container spacing={2} sx={{ mb: 2, flexWrap: 'nowrap' }}>
            <Grid item xs sx={{ minWidth: 0 }}>
              <TextField
                fullWidth
                size="small"
                label="语料名称"
                value={filterCorpusName}
                onChange={(e) => setFilterCorpusName(e.target.value)}
              />
            </Grid>
            <Grid item xs sx={{ minWidth: 0 }}>
              <TextField
                fullWidth
                size="small"
                label="文字内容"
                value={filterTextContent}
                onChange={(e) => setFilterTextContent(e.target.value)}
              />
            </Grid>
            <Grid item xs sx={{ minWidth: 0 }}>
              <TextField
                fullWidth
                size="small"
                label="所属流程"
                value={filterProcessFlow}
                onChange={(e) => setFilterProcessFlow(e.target.value)}
              />
            </Grid>
            <Grid item xs sx={{ minWidth: 0 }}>
              <FormControl fullWidth size="small">
                <InputLabel>语料类型</InputLabel>
                <Select
                  value={filterCorpusType}
                  label="语料类型"
                  onChange={(e) => setFilterCorpusType(e.target.value)}
                >
                  <MenuItem value="全部">全部</MenuItem>
                  <MenuItem value="主流程">主流程</MenuItem>
                  <MenuItem value="知识库">知识库</MenuItem>
                  <MenuItem value="功能话术">功能话术</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs sx={{ minWidth: 0 }}>
              <FormControl fullWidth size="small">
                <InputLabel>验听状态</InputLabel>
                <Select
                  value={filterAuditStatus}
                  label="验听状态"
                  onChange={(e) => setFilterAuditStatus(e.target.value)}
                >
                  <MenuItem value="全部">全部</MenuItem>
                  <MenuItem value="未验听">未验听</MenuItem>
                  <MenuItem value="已验听">已验听</MenuItem>
                  <MenuItem value="已标记">已标记</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {/* Filter Actions */}
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <Button variant="contained" size="small" onClick={handleSelectCurrent}>
              追选当前
            </Button>
            <Button variant="contained" size="small" onClick={handleClearAll}>
              全部清空
            </Button>
          </Box>

          {/* List */}
          <List sx={{ pt: 0, maxHeight: '400px', overflow: 'auto', borderTop: '1px solid #eee' }}>
            {filteredCorpus.length > 0 ? (
              filteredCorpus.map((item) => (
                <div key={item.uniqueId}>
                  <ListItem disablePadding>
                    <ListItemButton onClick={() => handleCorpusToggle(item.uniqueId)} dense alignItems="flex-start">
                      <ListItemIcon sx={{ mt: 1 }}>
                        <Checkbox
                          edge="start"
                          checked={selectedCorpusIndices.has(item.uniqueId)}
                          tabIndex={-1}
                          disableRipple
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <Typography variant="subtitle1" component="span" fontWeight="bold">
                              {item.index}
                            </Typography>
                            {item.canvasName && (
                              <Chip label={item.canvasName} size="small" variant="outlined" />
                            )}
                            <Chip
                              label={getStatusLabel(item.audioStatus)}
                              size="small"
                              color={getStatusColor(item.audioStatus)}
                              sx={{ height: 20, fontSize: '0.7rem' }}
                            />
                          </Box>
                        }
                        secondary={
                          <Typography variant="body2" color="text.secondary">
                            {item.text}
                          </Typography>
                        }
                      />
                    </ListItemButton>
                  </ListItem>
                  <Divider />
                </div>
              ))
            ) : (
              <Typography sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
                没有找到匹配的语料
              </Typography>
            )}
          </List>
          <Box sx={{ mt: 2, textAlign: 'right' }}>
            <Typography variant="caption" color="text.secondary">
              已选择 {selectedCorpusIndices.size} 个语料
            </Typography>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>取消</Button>
        <Button onClick={handleConfirm} variant="contained">确定</Button>
      </DialogActions>
    </>
  );
};

/**
 * CorpusSelectionDialog
 *
 * A dialog component for filtering and selecting corpus items from a list.
 * Extracted from TtsEditor.jsx to improve maintainability.
 *
 * @param {boolean} open - Whether the dialog is open
 * @param {function} onClose - Handler for closing the dialog
 * @param {function} onConfirm - Handler for confirming selection, receives (selectedItems)
 * @param {Array} corpusList - List of corpus items to display
 * @param {string} scriptName - Name of the current script (for display)
 */
const CorpusSelectionDialog = ({ open, onClose, ...otherProps }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <CorpusSelectionInner onClose={onClose} {...otherProps} />
    </Dialog>
  );
};

export default CorpusSelectionDialog;
