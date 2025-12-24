import { useState, useRef, useEffect } from 'react';
import {
  Box, Typography, Button, Tooltip, TextField, Chip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import RefreshIcon from '@mui/icons-material/Refresh';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import ErrorIcon from '@mui/icons-material/Error';
import WaveformEditor from './WaveformEditor';

function AudioItem({
  segment,
  segmentIndex,
  // voice, // Unused
  isCurrentlyPlaying,
  onDelete,
  onUpdate,
  onRegenerate,
  setMessage
}) {
  const [text, setText] = useState(segment.text);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const audioRef = useRef(null);
  const textAreaRef = useRef(null);

  useEffect(() => {
    setText(segment.text);
  }, [segment.text]);

  // Regenerate audio
  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      await onRegenerate(text);
    } catch {
      // Error handled in parent
    } finally {
      setIsRegenerating(false);
    }
  };

  // Handle audio play
  const handleAudioPlay = () => {
    onUpdate({ played: true, recent: true });
  };

  // Handle editor save
  const handleEditorSave = (newBlob) => {
    if (segment.url) {
      URL.revokeObjectURL(segment.url);
    }
    const newUrl = URL.createObjectURL(newBlob);
    onUpdate({
      blob: newBlob,
      url: newUrl,
      played: true,
      recent: true
    });
    setEditorOpen(false);
    setMessage({ text: '音频编辑已保存', type: 'success' });
  };

  const hasError = !!segment.error;

  return (
    <>
      <Box
        sx={{
          mb: 2,
          p: 2,
          bgcolor: 'background.paper',
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          transition: 'all 0.3s ease',
          '&:hover': {
              borderColor: 'text.primary'
          }
        }}
        className="fade-in"
      >
        {/* Controls Row */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                bgcolor: segment.recent ? 'warning.main' : (segment.played ? 'success.main' : 'grey.400'),
                transition: 'all 0.3s ease'
              }}
            />
            <Chip
              icon={<MusicNoteIcon />}
              label={`片段 ${segmentIndex + 1}`}
              variant="outlined"
              size="small"
              sx={{ borderColor: 'transparent' }}
            />
          </Box>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Edit Button */}
            {!hasError && segment.url && (
              <Tooltip title="编辑波形">
                <Button
                  size="small"
                  variant="outlined"
                  color="secondary"
                  startIcon={<EditIcon />}
                  onClick={() => {
                    setEditorOpen(true);
                    onUpdate({ recent: true });
                  }}
                >
                  编辑
                </Button>
              </Tooltip>
            )}
            {/* Delete Button */}
            <Button
              size="small"
              variant="text"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={onDelete}
            >
              删除
            </Button>
            {/* Regenerate Button */}
            <Button
              size="small"
              variant="outlined"
              color="primary"
              startIcon={<RefreshIcon />}
              onClick={handleRegenerate}
              disabled={isRegenerating}
            >
              {isRegenerating ? '生成中...' : '重新生成'}
            </Button>
          </Box>
        </Box>

        {/* Text Area */}
        <Box
          sx={{
            p: 1.5,
            mb: 1.5,
            bgcolor: 'background.default',
            borderRadius: 2
          }}
        >
          <TextField
            inputRef={textAreaRef}
            multiline
            fullWidth
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={() => onUpdate({ text: text })}
            variant="standard"
            InputProps={{
              disableUnderline: true,
              sx: { fontSize: '0.9rem' }
            }}
          />
        </Box>

        {/* Audio Player or Error */}
        {hasError ? (
          <Box sx={{
            p: 1.5,
            bgcolor: 'rgba(232, 67, 147, 0.05)',
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            color: 'error.main'
          }}>
            <ErrorIcon />
            <Typography variant="body2">生成失败: {segment.error}</Typography>
          </Box>
        ) : (
          <audio
            ref={audioRef}
            controls
            src={segment.url}
            onPlay={handleAudioPlay}
            style={{ width: '100%', borderRadius: 10, height: 40 }}
          />
        )}
      </Box>

      {/* Waveform Editor Dialog */}
      {editorOpen && segment.url && (
        <WaveformEditor
          open={editorOpen}
          onClose={() => setEditorOpen(false)}
          audioUrl={segment.url}
          audioBlob={segment.blob}
          onSave={handleEditorSave}
        />
      )}
    </>
  );
}

export default AudioItem;
