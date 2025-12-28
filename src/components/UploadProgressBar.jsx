import React from 'react';
import { Box, Typography, IconButton, Switch, Divider, CircularProgress } from '@mui/material';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';

/**
 * UploadProgressBar Component
 * Displays the upload progress and target script controls at the bottom right.
 */
const UploadProgressBar = ({
  visible,
  isExpanded,
  onToggleExpand,
  targetScript,
  onLinkScript,
  syncTextEnabled,
  onSyncTextChange,
  uploadedCount,
  totalCount
}) => {
  if (!visible) return null;

  return (
    <Box
        sx={{
            position: 'fixed',
            bottom: 40,
            right: 40,
            bgcolor: 'background.paper',
            boxShadow: 3,
            borderRadius: 4,
            p: 2,
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            transition: 'all 0.3s ease',
        }}
    >
        <IconButton
            onClick={onToggleExpand}
            size="small"
            aria-label="toggle progress bar"
            sx={{ mr: isExpanded ? 1 : 0 }}
        >
            {isExpanded ? <KeyboardArrowRightIcon /> : <KeyboardArrowLeftIcon />}
        </IconButton>

        {isExpanded && (
            <>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', mr: 1, minWidth: 150 }}>
                    <Typography variant="body2" component="div" sx={{ fontWeight: 'bold' }}>
                        目标话术：
                        <Typography
                            component="span"
                            variant="body2"
                            onClick={onLinkScript}
                            sx={{
                                color: '#0984e3',
                                cursor: 'pointer',
                                textDecoration: 'underline',
                                fontWeight: 'bold',
                                '&:hover': { color: '#74b9ff' }
                            }}
                        >
                            {targetScript ? targetScript.scriptName : '未选择'}
                        </Typography>
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
                            文本同步
                        </Typography>
                        <Switch
                            size="small"
                            checked={syncTextEnabled}
                            onChange={onSyncTextChange}
                            inputProps={{ 'aria-label': 'sync text switch' }}
                        />
                    </Box>
                </Box>

                <Divider orientation="vertical" flexItem sx={{ height: 40, alignSelf: 'center' }} />
            </>
        )}

        <Box sx={{ position: 'relative', display: 'inline-flex' }}>
            <CircularProgress
                variant="determinate"
                value={totalCount > 0 ? (uploadedCount / totalCount) * 100 : 0}
                size={50}
                thickness={4}
                sx={{ color: '#00CEC9' }}
            />
            <Box
                sx={{
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    position: 'absolute',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Typography variant="caption" component="div" color="text.secondary">
                    {Math.round(totalCount > 0 ? (uploadedCount / totalCount) * 100 : 0)}%
                </Typography>
            </Box>
        </Box>
        <Box>
            <Typography variant="subtitle2" fontWeight="bold">
                上传进度
            </Typography>
            <Typography variant="body2" color="text.secondary">
                {uploadedCount} / {totalCount}
            </Typography>
        </Box>
    </Box>
  );
};

export default UploadProgressBar;
