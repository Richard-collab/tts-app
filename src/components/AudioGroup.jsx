import { useState, useCallback, useRef, useEffect } from 'react';
import {
  Box, Paper, Typography, Button, IconButton, Tooltip, Checkbox, CircularProgress, TextField
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import DownloadIcon from '@mui/icons-material/Download';
import AudioFileIcon from '@mui/icons-material/AudioFile';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AudioItem from './AudioItem';

function AudioGroup({
  group,
  groupIndex,
  voice,
  checked,
  onToggle,
  onDeleteGroup,
  onDeleteSegment,
  onUpdateSegment,
  onRegenerateSegment,
  onUploadGroup,
  onUpdateGroupName,
  mergeAudioSegments,
  mergedAudiosRef,
  setMessage
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [currentPlayingIndex, setCurrentPlayingIndex] = useState(null);
  const playControlRef = useRef({ audio: null, stop: false });

  const hasValidSegments = group.segments.some(seg => !seg.error);

  // Helper function to play a single segment URL
  function playSegmentUrl(url) {
    return new Promise((resolve) => {
      const audio = new Audio(url);
      playControlRef.current.audio = audio;

      const cleanup = () => {
        if (playControlRef.current.audio === audio) playControlRef.current.audio = null;
        audio.removeEventListener('ended', onEnded);
        audio.removeEventListener('error', onError);
      };
      const onEnded = () => { cleanup(); resolve(); };
      const onError = () => { cleanup(); resolve(); };

      audio.addEventListener('ended', onEnded);
      audio.addEventListener('error', onError);
      audio.play().catch(() => { cleanup(); resolve(); });
    });
  }

  // Play merged audio (sequentially)
  const handlePlayGroup = useCallback(async () => {
    // Capture valid segment indices and URLs at the start to avoid stale references
    const validSegmentData = group.segments
      .map((seg, idx) => ({ index: idx, url: seg.url, hasError: !!seg.error }))
      .filter(item => !item.hasError && item.url);
    
    if (validSegmentData.length === 0) {
      setMessage({ text: '没有可用的音频片段进行播放', type: 'error' });
      return;
    }

    if (isPlaying) {
      playControlRef.current.stop = true;
      if (playControlRef.current.audio) {
        try {
          playControlRef.current.audio.pause();
        } catch {
          // Ignore error when pausing
        }
      }
      playControlRef.current.audio = null;
      setIsPlaying(false);
      setCurrentPlayingIndex(null);
      return;
    }

    setIsPlaying(true);
    playControlRef.current.stop = false;
    
    for (let i = 0; i < validSegmentData.length; i++) {
      if (playControlRef.current.stop) break;
      const { index: realIndex, url } = validSegmentData[i];
      setCurrentPlayingIndex(realIndex);
      onUpdateSegment(groupIndex, realIndex, { played: true, recent: true });
      try {
        await playSegmentUrl(url);
      } catch (err) {
        console.error(err);
      }
    }

    setIsPlaying(false);
    setCurrentPlayingIndex(null);
    playControlRef.current.stop = false;
  }, [group, groupIndex, isPlaying, onUpdateSegment, setMessage]);

  // Download merged audio
  const handleDownloadGroup = useCallback(async () => {
    const validSegments = group.segments.filter(seg => !seg.error);
    if (validSegments.length === 0) {
      setMessage({ text: '没有可用的音频片段进行合并', type: 'error' });
      return;
    }

    setIsDownloading(true);

    try {
      if (!mergedAudiosRef.current[groupIndex]) {
        const mergedBlob = await mergeAudioSegments(validSegments);
        mergedAudiosRef.current[groupIndex] = { blob: mergedBlob, url: URL.createObjectURL(mergedBlob) };
      }

      const a = document.createElement('a');
      a.href = mergedAudiosRef.current[groupIndex].url;
      a.download = `${group.index}.wav`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      setMessage({ text: '完整音频下载成功！', type: 'success' });
    } catch (error) {
      setMessage({ text: `合并音频失败: ${error.message}`, type: 'error' });
    } finally {
      setIsDownloading(false);
    }
  }, [group, groupIndex, mergeAudioSegments, mergedAudiosRef, setMessage]);

  // Upload Group
  const handleUpload = async () => {
    if (!hasValidSegments) {
        setMessage({ text: '没有可上传的音频片段', type: 'error' });
        return;
    }
    if (!onUploadGroup) return;

    setIsUploading(true);
    try {
        await onUploadGroup(groupIndex);
    } catch (error) {
        // Error handling should be done in parent mostly, but we catch here just in case
        console.error(error);
    } finally {
        setIsUploading(false);
    }
  };

  // Cleanup effect
  useEffect(() => {
    return () => {
      const controlRef = playControlRef.current;
      controlRef.stop = true;
      if (controlRef.audio) {
        try {
          controlRef.audio.pause();
        } catch {
          // Ignore error when pausing
        }
      }
      controlRef.audio = null;
    };
  }, []);

  return (
    <Paper
      sx={{
        p: 2,
        mb: 2,
        bgcolor: '#F8F9FA',
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 12px 35px rgba(108, 92, 231, 0.12)',
          borderColor: 'primary.light'
        }
      }}
      className="slide-in"
    >
      {/* Group Header */}
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 2,
        pb: 1.5,
        borderBottom: '1px dashed',
        borderColor: 'divider',
        flexWrap: 'wrap',
        gap: 1
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Checkbox
            checked={!!checked}
            onChange={(e) => onToggle(e.target.checked)}
            color="primary"
          />
          <AudioFileIcon color="primary" />
          <TextField
            variant="standard"
            value={group.index}
            onChange={(e) => onUpdateGroupName && onUpdateGroupName(groupIndex, e.target.value)}
            placeholder="语料名称"
            InputProps={{
              disableUnderline: true,
              sx: { fontSize: '1rem', fontWeight: 600, color: '#1976d2' }
            }}
            sx={{ minWidth: 200 }}
          />
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
              size="small"
              variant={group.isUploaded ? "outlined" : "contained"}
              color="success"
              startIcon={isUploading ? <CircularProgress size={20} color="inherit" /> : (group.isUploaded ? <CheckCircleIcon /> : <CloudUploadIcon />)}
              onClick={handleUpload}
              disabled={isUploading || !hasValidSegments}
          >
              {isUploading ? '上传中...' : (group.isUploaded ? '已上传' : (group.hasUploadedHistory ? '再次上传' : '上传音频'))}
          </Button>
          <Button
            size="small"
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => {
              if (window.confirm(`确定要删除语料"${group.index}"的所有音频片段吗？`)) {
                onDeleteGroup(groupIndex);
              }
            }}
          >
            删除音频组
          </Button>
          <Button
            size="small"
            variant="contained"
            startIcon={isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
            onClick={handlePlayGroup}
            disabled={!hasValidSegments}
          >
            {isPlaying ? '暂停播放' : '播放完整音频'}
          </Button>
          <Button
            size="small"
            variant="contained"
            color="primary"
            startIcon={<DownloadIcon />}
            onClick={handleDownloadGroup}
            disabled={!hasValidSegments || isDownloading}
          >
            {isDownloading ? '合并中...' : '下载完整音频'}
          </Button>
        </Box>
      </Box>

      {/* Audio Items */}
      {group.segments.map((segment, segmentIndex) => (
        <AudioItem
          key={`segment-${groupIndex}-${segmentIndex}`}
          segment={segment}
          segmentIndex={segmentIndex}
          groupIndex={groupIndex}
          voice={voice}
          isCurrentlyPlaying={currentPlayingIndex === segmentIndex}
          onDelete={() => {
            if (window.confirm('确定要删除这个音频片段吗？')) {
              onDeleteSegment(groupIndex, segmentIndex);
            }
          }}
          onUpdate={(newData) => onUpdateSegment(groupIndex, segmentIndex, newData)}
          onRegenerate={(newText) => onRegenerateSegment(groupIndex, segmentIndex, newText)}
          setMessage={setMessage}
        />
      ))}
    </Paper>
  );
}

export default AudioGroup;
