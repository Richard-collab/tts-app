import { useState, useRef, useEffect } from 'react';
import {
  Box, Typography, Button, Tooltip, TextField, Chip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import RefreshIcon from '@mui/icons-material/Refresh';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import ErrorIcon from '@mui/icons-material/Error';
import PauseCircleIcon from '@mui/icons-material/PauseCircle';
import WaveformEditor from './WaveformEditor';
import RichTextEditor from './RichTextEditor';

function AudioItem({
  segment,
  segmentIndex,
  voice,
  isCurrentlyPlaying,
  onDelete,
  onUpdate,
  onRegenerate,
  setMessage
}) {
  const [text, setText] = useState(segment.text);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [isEditorFocused, setIsEditorFocused] = useState(false);
  const audioRef = useRef(null);
  const richTextEditorRef = useRef(null);

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
          bgcolor: segment.recent ? 'rgba(253, 203, 110, 0.15)' : (isCurrentlyPlaying ? 'rgba(255, 165, 0, 0.05)' : 'rgba(255, 255, 255, 0.7)'),
          borderRadius: 2,
          borderLeft: '3px solid',
          borderLeftColor: hasError ? 'error.main' : (segment.recent ? 'warning.main' : (isCurrentlyPlaying ? '#FF9800' : 'primary.light')),
          transition: 'all 0.3s ease'
        }}
        className="fade-in"
      >
        {/* Controls Row */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 16,
                height: 16,
                borderRadius: '50%',
                bgcolor: segment.recent ? 'warning.main' : (segment.played ? 'success.main' : 'grey.400'),
                transition: 'all 0.3s ease'
              }}
            />
            <Chip
              icon={<MusicNoteIcon />}
              label={`片段 ${segmentIndex + 1}`}
              color="primary"
              size="small"
            />
          </Box>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Edit Button */}
            {!hasError && segment.url && (
              <Tooltip title="编辑波形">
                <Button
                  size="small"
                  variant="contained"
                  color="info"
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
            {/* Insert Pause Button */}
            <Button
              size="small"
              variant="contained"
              color={isEditorFocused ? "warning" : "inherit"}
              disabled={!isEditorFocused || !(voice && (voice.includes('MinMax') || voice.includes('阿里')))}
              startIcon={<PauseCircleIcon />}
              onMouseDown={(e) => e.preventDefault()} // Prevent focus loss
              onClick={() => {
                if (richTextEditorRef.current) {
                  richTextEditorRef.current.insertPause();
                }
              }}
              sx={{
                bgcolor: isEditorFocused ? undefined : 'rgba(0,0,0,0.12)',
                color: isEditorFocused ? undefined : 'rgba(0,0,0,0.26)'
              }}
            >
              插入停顿
            </Button>
            {/* Delete Button */}
            <Button
              size="small"
              variant="contained"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={onDelete}
            >
              删除
            </Button>
            {/* Regenerate Button */}
            <Button
              size="small"
              variant="contained"
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
            bgcolor: segment.recent ? 'rgba(253, 203, 110, 0.1)' : (isCurrentlyPlaying ? 'rgba(255, 165, 0, 0.05)' : 'rgba(108, 92, 231, 0.05)'),
            borderLeft: '3px solid',
            borderLeftColor: segment.recent ? 'warning.main' : (isCurrentlyPlaying ? '#FF9800' : 'primary.main'),
            borderRadius: '0 6px 6px 0'
          }}
        >
          <RichTextEditor
            ref={richTextEditorRef}
            value={text}
            voice={voice}
            onChange={(newText) => setText(newText)}
            onFocus={() => setIsEditorFocused(true)}
            onBlur={() => {
              setIsEditorFocused(false);
              onUpdate({ text: text });
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
