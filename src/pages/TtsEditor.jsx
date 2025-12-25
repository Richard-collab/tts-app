import { useState, useRef, useCallback, useEffect } from 'react';
import {
  Container, Paper, Typography, Box, Grid, FormControl, InputLabel, Select, MenuItem,
  Tabs, Tab, TextField, Button, LinearProgress, Alert,
  CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions,
  List, ListItem, ListItemText, ListItemButton, Divider, Checkbox, ListItemIcon, Fab,
  ToggleButton, ToggleButtonGroup, Chip, FormControlLabel, Switch, Menu
} from '@mui/material';
import BoltIcon from '@mui/icons-material/Bolt';
import DownloadIcon from '@mui/icons-material/Download';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import KeyboardIcon from '@mui/icons-material/Keyboard';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import DescriptionIcon from '@mui/icons-material/Description';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ScienceIcon from '@mui/icons-material/Science';
import HelpIcon from '@mui/icons-material/Help';
import DeleteIcon from '@mui/icons-material/Delete';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import AudioGroup from '../components/AudioGroup';
import { login, fetchScripts, fetchScriptCorpus, uploadAudio, updateScriptText, lockScript, unlockScript, fetchRemoteAudio } from '../utils/baizeApi';
import { bufferToWave, mergeBuffers } from '../utils/audioUtils';
import { splitTextIntoSentences } from '../utils/textUtils';
import useWorkspacePersistence from '../hooks/useWorkspacePersistence';
import '../App.css';

// Voice options
const voiceOptions = [
  { value: '', label: '请选择...' },
  { value: 'LAX音色-阿里', label: 'LAX音色-阿里' },
  { value: 'LS音色-阿里', label: 'LS音色-阿里' },
  { value: 'YD音色-MinMax', label: 'YD音色-MinMax' },
  { value: 'YD音色1-MinMax', label: 'YD音色1-MinMax' },
  { value: 'YD音色2-MinMax', label: 'YD音色2-MinMax' },
  { value: 'YY音色-MinMax', label: 'YY音色-MinMax' },
  { value: 'XL音色-MinMax', label: 'XL音色-MinMax' },
  { value: 'TT音色-MinMax', label: 'TT音色-MinMax' },
  { value: 'MD音色-MinMax', label: 'MD音色-MinMax' },
  { value: 'LS音色-MinMax', label: 'LS音色-MinMax' },
  { value: 'WW音色-MinMax', label: 'WW音色-MinMax' },
  { value: 'LAX音色-MinMax', label: 'LAX音色-MinMax' },
  { value: 'YZ音色-MinMax', label: 'YZ音色-MinMax' },
  { value: 'YZ音色-MinMax', label: 'YZ音色-MinMax'},
  { value: 'YD音色1', label: 'YD音色1' },
  { value: 'YD音色2', label: 'YD音色2' },
  { value: 'YY音色', label: 'YY音色' },
  { value: 'XL音色', label: 'XL音色' },
  { value: 'TT音色', label: 'TT音色' },
  { value: 'MD音色', label: 'MD音色' },
  { value: 'LS音色', label: 'LS音色' },
  { value: '清甜桃桃', label: '清甜桃桃' },
  { value: '软萌团子', label: '软萌团子' },
];

// Speed options
const speedOptions = [
  { value: '0.5', label: '0.5 (很慢)' },
  { value: '0.6', label: '0.6' },
  { value: '0.7', label: '0.7' },
  { value: '0.8', label: '0.8' },
  { value: '0.9', label: '0.9' },
  { value: '1.0', label: '1.0 (正常)' },
  { value: '1.1', label: '1.1' },
  { value: '1.2', label: '1.2' },
  { value: '1.3', label: '1.3' },
  { value: '1.4', label: '1.4' },
  { value: '1.5', label: '1.5 (很快)' },
];

// Volume options
const volumeOptions = [
  { value: '0.5', label: '0.5 (较小)' },
  { value: '0.6', label: '0.6' },
  { value: '0.7', label: '0.7' },
  { value: '0.8', label: '0.8' },
  { value: '0.9', label: '0.9' },
  { value: '1.0', label: '1.0 (正常)' },
  { value: '1.1', label: '1.1' },
  { value: '1.2', label: '1.2' },
  { value: '1.3', label: '1.3' },
  { value: '1.4', label: '1.4' },
  { value: '1.5', label: '1.5 (较大)' },
];

// Pitch options
const pitchOptions = [
  { value: '0.1', label: '0.1 (较低)' },
  { value: '0.2', label: '0.2' },
  { value: '0.3', label: '0.3' },
  { value: '0.4', label: '0.4' },
  { value: '0.5', label: '0.5' },
  { value: '0.6', label: '0.6' },
  { value: '0.7', label: '0.7' },
  { value: '0.8', label: '0.8' },
  { value: '0.9', label: '0.9' },
  { value: '1.0', label: '1.0 (正常)' },
  { value: '1.1', label: '1.1' },
  { value: '1.2', label: '1.2' },
  { value: '1.3', label: '1.3' },
  { value: '1.4', label: '1.4' },
  { value: '1.5', label: '1.5' },
  { value: '1.6', label: '1.6' },
  { value: '1.7', label: '1.7' },
  { value: '1.8', label: '1.8' },
  { value: '1.9', label: '1.9' },
  { value: '2.0', label: '2.0 (较高)' },
];

const contentLeft = `额，XXX。呃，XXX。嗯，XXX
嗯XXX。啊XXX。哎XXX。XXX嘛。XXX哈。XXX啊。XXX呀。
这个XXX。那XXX。这个XXX。它这个XXX。那就XXX。
XXX的话XXX。XXX的。XXX啦。
XXX的话，XXX呢，
然后XXX。也就是XXX。那也XXX。您看XXX。另外XXX。然后的话XXX。
XXX好吧。XXX好嘛。XXX的哈。
那这个XXX还是XXX。就XXX也XXX。那XXX也XXX。`;

const contentRight1 = `
如，银行的行，避免读成行走的行，直接改成“银航”
`;

const contentRight2 = `
那这个。然后呢。接下来。接下来的话。嗯然后就是。它这个。的那个。呃这个。再加上。
`;

const contentRight3 = `
1、加强语气：“”《》【】、、、！
2、避免合成断词断错，可以用引号或括号把某些词圈到一起：“” '' <>《》（）【】
3、让断句更合理：用对逗号句号
`;

function TtsEditor() {
  // Form state
  const [voice, setVoice] = useState('');
  const [speed, setSpeed] = useState('1.0');
  const [volume, setVolume] = useState('1.0');
  const [pitch, setPitch] = useState('1.0');
  const [splitOption, setSplitOption] = useState('no');
  const [tabValue, setTabValue] = useState(0);
  const [textInput, setTextInput] = useState('');
  const [fileName, setFileName] = useState('未选择文件');
  const [openPasteDialog, setOpenPasteDialog] = useState(false);
  const [pasteContent, setPasteContent] = useState('');
  const fileInputRef = useRef(null);
  const excelDataRef = useRef(null);
  const baizeDataRef = useRef(null);

  // Baize API State
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loginOpen, setLoginOpen] = useState(false);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [scriptDialogOpen, setScriptDialogOpen] = useState(false);
  const [scriptList, setScriptList] = useState([]);
  const [scriptSearch, setScriptSearch] = useState('');
  const [isFetchingScripts, setIsFetchingScripts] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [helpDialogOpen, setHelpDialogOpen] = useState(false);

  // User Menu State
  const [anchorElUser, setAnchorElUser] = useState(null);

  // Corpus Dialog State
  const [corpusDialogOpen, setCorpusDialogOpen] = useState(false);
  const [corpusList, setCorpusList] = useState([]);

  // New Filters
  const [filterCorpusName, setFilterCorpusName] = useState('');
  const [filterTextContent, setFilterTextContent] = useState('');
  const [filterProcessFlow, setFilterProcessFlow] = useState('');
  const [filterCorpusType, setFilterCorpusType] = useState('全部');
  const [filterAuditStatus, setFilterAuditStatus] = useState('全部');

  const [selectedCorpusIndices, setSelectedCorpusIndices] = useState(new Set());
  const [tempScript, setTempScript] = useState(null);

  // Validation State (Target Script)
  const [targetScript, setTargetScript] = useState(null);
  const [targetScriptCorpusList, setTargetScriptCorpusList] = useState([]);
  // const [isLinkingScript, setIsLinkingScript] = useState(false); // Deprecated: Mode flag
  const [scriptDialogMode, setScriptDialogMode] = useState(''); // 'import' | 'link' | 'batch_upload' | 'single_upload'
  const [selectedScript, setSelectedScript] = useState(null);
  const [syncTextEnabled, setSyncTextEnabled] = useState(true);

  // New State for Single Upload Workflow
  const [singleUploadGroupIndex, setSingleUploadGroupIndex] = useState(null);
  const [hasConfirmedSingleUploadScript, setHasConfirmedSingleUploadScript] = useState(false);
  const [uploadingGroupIndices, setUploadingGroupIndices] = useState(new Set());

  // Result Dialog State
  const [resultDialogOpen, setResultDialogOpen] = useState(false);
  const [resultDialogMessage, setResultDialogMessage] = useState('');

  // Progress state
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('准备生成音频...');
  const [message, setMessage] = useState({ text: '', type: '' });
  
  // Audio data
  const [audioGroups, setAudioGroups] = useState([]);
  const mergedAudiosRef = useRef({});

  // Workspace Persistence Hook
  const { workspaceInfo, clearWorkspace } = useWorkspacePersistence({
    audioGroups,
    textInput,
    targetScript,
    tabValue,
    setAudioGroups,
    setTextInput,
    setTargetScript,
    setTabValue,
    baizeDataRef,
    excelDataRef
  });

  // Init user from local storage
  useEffect(() => {
    const savedUser = localStorage.getItem('audioEditor_user');
    const savedToken = localStorage.getItem('audioEditor_token');
    if (savedUser && savedToken) {
        setUser(JSON.parse(savedUser));
        setToken(savedToken);
    }
  }, []);

  // Handler for linking script without importing content (context only)
  const handleLinkScript = useCallback(() => {
       if (!token) {
          setMessage({ text: '请先登录', type: 'error' });
          handleLoginOpen();
          return;
      }
      // setIsLinkingScript(true); // Replaced by mode
      setScriptDialogMode('link');
      if (targetScript) setSelectedScript(targetScript); // Pre-select if exists

      setScriptSearch('');
      setScriptDialogOpen(true);
      setIsFetchingScripts(true);
      fetchScripts(token).then(res => {
          if (res.code === "2000" && Array.isArray(res.data)) {
            setScriptList(res.data);
          } else {
              // error handled in fetch or silenced
          }
      }).finally(() => {
          setIsFetchingScripts(false);
      });
  }, [token, targetScript]);

  // Merge audio segments (Moved UP to be accessible by handleSingleGroupUpload)
  const mergeAudioSegments = useCallback(async (audioSegments) => {
    return new Promise((resolve) => {
      const audioContext = new AudioContext({ sampleRate: 8000 });
      const audioBuffers = [];
      let buffersLoaded = 0;

      audioSegments.forEach((segment, index) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          audioContext.decodeAudioData(e.target.result, (buffer) => {
            audioBuffers[index] = buffer;
            buffersLoaded++;
            if (buffersLoaded === audioSegments.length) {
              const wavBlob = mergeBuffers(audioContext, audioBuffers);
              resolve(wavBlob);
            }
          }, () => {
            buffersLoaded++;
            if (buffersLoaded === audioSegments.length) {
              const wavBlob = mergeBuffers(audioContext, audioBuffers);
              resolve(wavBlob);
            }
          });
        };
        reader.readAsArrayBuffer(segment.blob);
      });
    });
  }, []);

  // Login Handlers
  const handleLoginOpen = () => setLoginOpen(true);
  const handleLoginClose = () => setLoginOpen(false);
  const handleLoginSubmit = async () => {
    if (!loginUsername || !loginPassword) {
        setMessage({ text: '请输入用户名和密码', type: 'error' });
        return;
    }
    try {
        const result = await login(loginUsername, loginPassword);
        const newUser = { account: result.account || loginUsername };
        const newToken = result.token;

        setUser(newUser);
        setToken(newToken);

        localStorage.setItem('audioEditor_user', JSON.stringify(newUser));
        localStorage.setItem('audioEditor_token', newToken);

        setMessage({ text: `登录成功: ${newUser.account}`, type: 'success' });
        handleLoginClose();
    } catch (error) {
        setMessage({ text: `登录失败: ${error.message}`, type: 'error' });
    }
  };
  const handleLogout = () => {
      setUser(null);
      setToken(null);
      localStorage.removeItem('audioEditor_user');
      localStorage.removeItem('audioEditor_token');
      setMessage({ text: '已退出登录', type: 'success' });
      setAnchorElUser(null);
  };

  // User Menu Handlers
  const handleOpenUserMenu = (event) => {
      setAnchorElUser(event.currentTarget);
  };
  const handleCloseUserMenu = () => {
      setAnchorElUser(null);
  };
  const handleClearWorkspace = () => {
      if (window.confirm("确定要删除当前工作区的所有数据吗？此操作不可撤销。")) {
          clearWorkspace();
          setMessage({ text: '工作区已清空', type: 'success' });
      }
      handleCloseUserMenu();
  };


  // Baize Import Handlers
  const handleOpenScriptDialog = async () => {
      if (!token) {
          setMessage({ text: '请先登录', type: 'error' });
          handleLoginOpen();
          return;
      }

      setScriptDialogMode('import');
      if (targetScript) setSelectedScript(targetScript); // Optional: pre-select current if want to re-import

      setScriptSearch('');
      setScriptDialogOpen(true);
      setIsFetchingScripts(true);
      try {
          const res = await fetchScripts(token);
          if (res.code === "2000" && Array.isArray(res.data)) {
            setScriptList(res.data);
          } else {
            throw new Error(res.msg || "获取话术列表失败");
          }
      } catch (error) {
          setMessage({ text: `获取话术列表失败: ${error.message}`, type: 'error' });
      } finally {
          setIsFetchingScripts(false);
      }
  };

  // Helper logic extracted from old handleScriptSelect, now used by Confirm
  const executeScriptSelectionAction = async (script, mode) => {
      setMessage({ text: `正在获取话术语料: ${script.scriptName}...`, type: '' });

      try {
          const res = await fetchScriptCorpus(token, script.id);
          // Handle response structure: { code: "2000", data: { scriptUnitContents: [] } }
          const corpusData = res?.data?.scriptUnitContents || res?.scriptUnitContents;

          if (corpusData && Array.isArray(corpusData)) {
              // No aggregation
              const preparedData = corpusData.map((item, idx) => ({
                  index: item.contentName || `导入语料-${idx+1}`,
                  text: item.content,
                  corpusType: item.corpusType || '',
                  canvasName: item.canvasName || '',
                  audioStatus: item.audioStatus || '0',
                  audioPath: item.audioPath || '',
                  baizeData: {
                      id: item.id,
                      corpusId: item.corpusId,
                      text: item.content,
                      originalData: item
                  },
                  uniqueId: item.id || idx // Use ID if available, else index
              }));

              if (mode === 'link' || mode === 'batch_upload') {
                  // Only set target script for validation context
                  setTargetScript(script);
                  setTargetScriptCorpusList(preparedData);

                  if (mode === 'link') {
                     setMessage({ text: `已关联目标话术: ${script.scriptName}`, type: 'success' });
                  } else {
                     // batch_upload logic continues in its own flow
                  }
                  return preparedData; // Return for further use
              } else {
                  // Standard Import flow
                  setCorpusList(preparedData);
                  setTempScript(script);
                  // Auto-set target script as well for consistency
                  setTargetScript(script);
                  setTargetScriptCorpusList(preparedData);

                  // Reset filters
                  setFilterCorpusName('');
                  setFilterTextContent('');
                  setFilterProcessFlow('');
                  setFilterCorpusType('全部');
                  setFilterAuditStatus('全部');

                  // Select none by default
                  setSelectedCorpusIndices(new Set());
                  setCorpusDialogOpen(true);
                  setMessage({ text: '', type: '' });
                  return preparedData;
              }
          } else {
              throw new Error("话术语料为空或格式不正确");
          }
      } catch (error) {
          setMessage({ text: `获取话术语料失败: ${error.message}`, type: 'error' });
          // setIsLinkingScript(false);
          throw error;
      }
  };

  const handleScriptSelect = (script) => {
      setSelectedScript(script);
  };

  const handleScriptDialogConfirm = async () => {
      if (!selectedScript) {
          setMessage({ text: '请选择一个话术', type: 'error' });
          return;
      }
      setScriptDialogOpen(false);

      // If script changed, reset the single upload confirmation flag
      if (targetScript && selectedScript.id !== targetScript.id) {
         setHasConfirmedSingleUploadScript(false);
      }

      if (scriptDialogMode === 'import' || scriptDialogMode === 'link') {
          await executeScriptSelectionAction(selectedScript, scriptDialogMode);
      } else if (scriptDialogMode === 'batch_upload') {
          try {
             const corpusList = await executeScriptSelectionAction(selectedScript, 'batch_upload');
             executeBatchUpload(selectedScript, corpusList);
          } catch (e) {
             console.error("Batch upload preparation failed", e);
          }
      } else if (scriptDialogMode === 'single_upload') {
          try {
              const corpusList = await executeScriptSelectionAction(selectedScript, 'batch_upload'); // Reuse 'batch_upload' mode logic to get data/link without extra side effects

              setHasConfirmedSingleUploadScript(true); // Mark as confirmed

              if (singleUploadGroupIndex !== null) {
                  executeSingleUpload(singleUploadGroupIndex, selectedScript, corpusList);
                  setSingleUploadGroupIndex(null);
              }
          } catch (e) {
              console.error("Single upload preparation failed", e);
              // Cleanup on error
              if (singleUploadGroupIndex !== null) {
                   setUploadingGroupIndices(prev => {
                      const newSet = new Set(prev);
                      newSet.delete(singleUploadGroupIndex);
                      return newSet;
                  });
                  setSingleUploadGroupIndex(null);
              }
          }
      }
  };

  const handleCorpusToggle = (id) => {
      const newSelected = new Set(selectedCorpusIndices);
      if (newSelected.has(id)) {
          newSelected.delete(id);
      } else {
          newSelected.add(id);
      }
      setSelectedCorpusIndices(newSelected);
  };

  const handleCorpusConfirm = async () => {
      const selectedItems = corpusList.filter(item => selectedCorpusIndices.has(item.uniqueId));
      if (selectedItems.length === 0) {
          alert("请至少选择一条语料");
          return;
      }

      setCorpusDialogOpen(false);
      setIsGenerating(true);
      setProgress(0);
      setStatus(`正在加载 ${selectedItems.length} 个语料音频...`);
      setMessage({ text: '', type: '' });
      setAudioGroups([]); // Clear existing

      const newGroups = [];
      let processedCount = 0;

      for (const item of selectedItems) {
          const group = {
              index: item.index,
              text: item.text,
              segments: [],
              baizeData: item.baizeData,
              checked: true,
              isUploaded: false
          };

          if (item.audioPath) {
              try {
                  const blob = await fetchRemoteAudio(item.audioPath);
                  const url = URL.createObjectURL(blob);
                  group.segments.push({
                      text: item.text,
                      blob: blob,
                      url: url,
                      played: false
                  });
              } catch (e) {
                  console.error(`Failed to load audio for ${item.index}`, e);
                  // Push text-only segment if audio load fails
                  group.segments.push({
                       text: item.text,
                       // error: `加载音频失败: ${e.message}` // Optional: showing error might clutter UI if many fail
                  });
              }
          } else {
              // No audio path, just text
              group.segments.push({
                  text: item.text
              });
          }

          newGroups.push(group);
          processedCount++;
          const percent = Math.round((processedCount / selectedItems.length) * 100);
          setProgress(percent);
          setStatus(`已加载 ${processedCount}/${selectedItems.length} 个语料...`);
      }

      baizeDataRef.current = selectedItems;
      setAudioGroups(newGroups);
      mergedAudiosRef.current = {}; // Reset merged cache

      setFileName(`已加载话术: ${tempScript.scriptName} (${selectedItems.length}条)`);
      setIsGenerating(false);
      setMessage({ text: `话术已加载 ${selectedItems.length} 条 (含音频预览)`, type: 'success' });
  };

  // Core Logic for Single Upload (Extracted)
  const executeSingleUpload = useCallback(async (groupIndex, activeScript, activeCorpusList) => {
      const group = audioGroups[groupIndex];
      if (!group) {
          setUploadingGroupIndices(prev => {
              const newSet = new Set(prev);
              newSet.delete(groupIndex);
              return newSet;
          });
          return;
      }

      // Find matching corpus in target script
      const matchedCorpus = activeCorpusList.find(c => c.index === group.index);
      if (!matchedCorpus) {
          setMessage({ text: `无法上传: 当前语料名称 "${group.index}" 不在目标话术 "${activeScript.scriptName}" 中`, type: 'error' });
          setUploadingGroupIndices(prev => {
              const newSet = new Set(prev);
              newSet.delete(groupIndex);
              return newSet;
          });
          return;
      }

      // Try to merge if valid segments exist
      let mergedBlob = null;
      if (mergedAudiosRef.current[groupIndex]) {
          mergedBlob = mergedAudiosRef.current[groupIndex].blob;
      } else {
          const validSegments = group.segments.filter(seg => !seg.error);
          if (validSegments.length > 0) {
              try {
                  mergedBlob = await mergeAudioSegments(validSegments);
              } catch (e) {
                  console.error("Merge failed for upload", e);
              }
          }
      }

      if (!mergedBlob) {
          setMessage({ text: '没有可上传的音频数据', type: 'error' });
          setUploadingGroupIndices(prev => {
              const newSet = new Set(prev);
              newSet.delete(groupIndex);
              return newSet;
          });
          return;
      }

      setMessage({ text: `正在上传语料: ${group.index}...`, type: '' });

      try {
          // Unlock Script
          await lockScript(token, activeScript.id);

          const currentFullText = group.segments.map(s => s.text).join('');
          const originalText = matchedCorpus.text; // Use matched corpus text as original reference
          const isTextChanged = currentFullText.replace(/\s/g, '') !== originalText.replace(/\s/g, '');

          const contentId = matchedCorpus.baizeData.id; // Use matched ID

          // Upload Audio
          const filename = `${group.index}.wav`;
          const res = await uploadAudio(token, contentId, mergedBlob, filename);

          if (res && res.code === "2000") {
              if (isTextChanged && syncTextEnabled) {
                  const corpusId = matchedCorpus.baizeData.corpusId;
                  await updateScriptText(token, contentId, corpusId, activeScript.id, currentFullText);
              }

              // Mark as uploaded
              setAudioGroups(prev => {
                  const updated = [...prev];
                  updated[groupIndex] = {
                    ...updated[groupIndex],
                    isUploaded: true,
                    hasUploadedHistory: true, // Mark history
                    baizeData: matchedCorpus.baizeData
                  };
                  return updated;
              });

              setMessage({ text: `上传成功: ${group.index}`, type: 'success' });
          } else if (res && (res.code === "666" || (res.msg && res.msg.includes('锁定')))) {
              setMessage({ text: `上传失败: 语料被锁定`, type: 'error' });
          } else {
              setMessage({ text: `上传失败: ${res?.msg || '未知错误'}`, type: 'error' });
          }

      } catch (error) {
          setMessage({ text: `上传出错: ${error.message}`, type: 'error' });
      } finally {
          // Remove from uploading set
          setUploadingGroupIndices(prev => {
              const newSet = new Set(prev);
              newSet.delete(groupIndex);
              return newSet;
          });

          // Lock Script
          try {
              await unlockScript(token, activeScript.id);
          } catch (e) {
              console.error("Lock failed", e);
          }
      }
  }, [audioGroups, token, syncTextEnabled, mergeAudioSegments]);

  // Single Group Upload Handler (UI Entry Point)
  const handleSingleGroupUpload = useCallback(async (groupIndex) => {
    if (!token) {
        setMessage({ text: '请先登录', type: 'error' });
        handleLoginOpen();
        return;
    }

    // Mark as uploading immediately
    setUploadingGroupIndices(prev => new Set(prev).add(groupIndex));

    // New Logic: Check if we need to confirm target script for single upload context
    // This happens if:
    // 1. No target script selected
    // 2. Target script selected but "Single Upload" not yet confirmed in this session (or since last script change)

    if (!targetScript || !hasConfirmedSingleUploadScript) {
        setSingleUploadGroupIndex(groupIndex);
        setScriptDialogMode('single_upload');
        if (targetScript) setSelectedScript(targetScript); // Pre-select

        // Open Dialog
        setScriptSearch('');
        setScriptDialogOpen(true);
        setIsFetchingScripts(true);
        try {
            const res = await fetchScripts(token);
            if (res.code === "2000" && Array.isArray(res.data)) {
              setScriptList(res.data);
            } else {
              // Fail silently or show error
            }
        } catch {
            // If fetch fails, we need to clear the uploading state because the dialog might not open or work
             setUploadingGroupIndices(prev => {
                const newSet = new Set(prev);
                newSet.delete(groupIndex);
                return newSet;
            });
        } finally {
            setIsFetchingScripts(false);
        }
        return;
    }

    // If confirmed, proceed immediately using current targetScript and list
    executeSingleUpload(groupIndex, targetScript, targetScriptCorpusList);

  }, [token, targetScript, hasConfirmedSingleUploadScript, targetScriptCorpusList, executeSingleUpload]);

  const handleBatchUploadClick = async () => {
    if (!token) {
        setMessage({ text: '请先登录', type: 'error' });
        handleLoginOpen();
        return;
    }
    if (audioGroups.length === 0) {
        setMessage({ text: '没有可上传的语料', type: 'error' });
        return;
    }

    setScriptDialogMode('batch_upload');
    if (targetScript) setSelectedScript(targetScript); // Pre-select current target script

    // Always open dialog
    setScriptSearch('');
    setScriptDialogOpen(true);
    setIsFetchingScripts(true);
    try {
        const res = await fetchScripts(token);
        if (res.code === "2000" && Array.isArray(res.data)) {
          setScriptList(res.data);
        } else {
          throw new Error(res.msg || "获取话术列表失败");
        }
    } catch (error) {
        setMessage({ text: `获取话术列表失败: ${error.message}`, type: 'error' });
    } finally {
        setIsFetchingScripts(false);
    }
  };

  // Core Batch Upload Logic (separated from UI handler)
  const executeBatchUpload = async (activeScript, activeCorpusList) => {
    let successCount = 0;
    let failCount = 0;
    let lockedErrorOccurred = false;

    const groupsToUpload = [];
    const skippedGroups = [];

    // Use passed corpus list for validation
    for (let i = 0; i < audioGroups.length; i++) {
        const group = audioGroups[i];
        if (group.checked === false) continue;

        const matchedCorpus = activeCorpusList.find(c => c.index === group.index);
        if (matchedCorpus) {
            groupsToUpload.push({ group, index: i, matchedCorpus });
        } else {
            skippedGroups.push(group.index);
        }
    }

    if (groupsToUpload.length === 0) {
         setMessage({ text: '没有与目标话术匹配的语料可上传 (请检查语料名称)', type: 'error' });
         return;
    }

    if (skippedGroups.length > 0) {
        if (!window.confirm(`发现 ${skippedGroups.length} 个语料未在目标话术中找到，将跳过上传。\n是否继续上传剩下的 ${groupsToUpload.length} 个语料？`)) {
            return;
        }
    } else {
         if (!window.confirm(`确定要将 ${groupsToUpload.length} 个语料上传到系统 (ID: ${activeScript.id}) 吗？这将覆盖系统中的原有音频。`)) {
            return;
        }
    }

    setIsUploading(true);
    setMessage({ text: '正在解锁话术...', type: '' });

    try {
        await lockScript(token, activeScript.id);
    } catch (error) {
        setMessage({ text: `解锁话术失败: ${error.message}`, type: 'error' });
        setIsUploading(false);
        return;
    }

    setMessage({ text: '正在上传音频...', type: '' });

    try {
        for (const item of groupsToUpload) {
            const { group, index: i, matchedCorpus } = item;
            let mergedBlob = null;
            if (mergedAudiosRef.current[i]) {
                mergedBlob = mergedAudiosRef.current[i].blob;
            } else {
                const validSegments = group.segments.filter(seg => !seg.error);
                if (validSegments.length > 0) {
                    try {
                        mergedBlob = await mergeAudioSegments(validSegments);
                    } catch (e) {
                        console.error("Merge failed for upload", e);
                    }
                }
            }

            if (!mergedBlob) {
                console.warn(`Skipping group ${group.index}: No audio generated`);
                continue;
            }

            const currentFullText = group.segments.map(s => s.text).join('');
            const originalText = matchedCorpus.text;
            const isTextChanged = currentFullText.replace(/\s/g, '') !== originalText.replace(/\s/g, '');

            const contentId = matchedCorpus.baizeData.id;
            try {
                const filename = `${group.index}.wav`;
                const res = await uploadAudio(token, contentId, mergedBlob, filename);

                if (res && (res.code === "666" || (res.msg && res.msg.includes('锁定')))) {
                    lockedErrorOccurred = true;
                    failCount++;
                } else if (res && res.code === "2000") {
                    if (isTextChanged && syncTextEnabled) {
                        const corpusId = matchedCorpus.baizeData.corpusId;
                        await updateScriptText(token, contentId, corpusId, activeScript.id, currentFullText);
                    }

                    setAudioGroups(prev => {
                        return prev.map((item, idx) => {
                            if (idx === i) {
                                return {
                                  ...item,
                                  isUploaded: true,
                                  hasUploadedHistory: true,
                                  baizeData: matchedCorpus.baizeData
                                };
                            }
                            return item;
                        });
                    });

                    successCount++;
                } else {
                    throw new Error(res.msg || "上传失败");
                }
            } catch (e) {
                console.error(`Failed to upload for contentId ${contentId}`, e);
                if (e.message && e.message.includes('锁定')) {
                    lockedErrorOccurred = true;
                }
                failCount++;
            }
        }

        if (lockedErrorOccurred) {
            setResultDialogOpen(true);
            setResultDialogMessage("上传过程中发现部分语料被锁定，无法更新。请检查语料状态。");
        }

        setMessage({
            text: `上传完成: 成功 ${successCount} 个, 失败 ${failCount} 个${lockedErrorOccurred ? ' (包含被锁定项目)' : ''}`,
            type: failCount > 0 ? 'warning' : 'success'
        });

    } catch (error) {
        setMessage({ text: `上传过程中断: ${error.message}`, type: 'error' });
    } finally {
        try {
             await unlockScript(token, activeScript.id);
        } catch (lockError) {
             console.error("Failed to lock script", lockError);
             const isError = failCount > 0 || lockedErrorOccurred;
             setMessage(prev => ({
                 text: prev.text + ` (注意: 话术锁定失败 - ${lockError.message})`,
                 type: isError ? 'error' : 'warning'
             }));
        }
        setIsUploading(false);
    }
  };

  // Parse Excel file
  const parseExcelFile = useCallback((file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          
          if (jsonData.length === 0) {
            reject(new Error('Excel文件中没有数据'));
            return;
          }
          
          const firstRow = jsonData[0];
          if (!Object.prototype.hasOwnProperty.call(firstRow, '语料名称') || !Object.prototype.hasOwnProperty.call(firstRow, '文字内容')) {
            reject(new Error('Excel文件表头必须包含"语料名称"和"文字内容"列'));
            return;
          }
          
          const validData = jsonData
            .filter(row => row['语料名称'] && row['文字内容'])
            .map(row => ({
              index: row['语料名称'],
              text: row['文字内容'].toString().trim()
            }))
            .filter(item => item.text !== '');
          
          if (validData.length === 0) {
            reject(new Error('Excel文件中没有有效的文本数据'));
            return;
          }
          resolve(validData);
        } catch (error) {
          reject(new Error('解析Excel文件失败: ' + error.message));
        }
      };
      reader.onerror = () => reject(new Error('读取文件失败'));
      reader.readAsArrayBuffer(file);
    });
  }, []);

  // Fetch with retry
  const fetchWithRetry = useCallback(async (url, options, maxRetries = 3, retryDelay = 1000) => {
    let lastError;
    for (let i = 0; i < maxRetries; i++) {
      try {
        const response = await fetch(url, options);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `请求失败: ${response.status}`);
        }
        return response;
      } catch (error) {
        lastError = error;
        if (i < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          retryDelay *= 2;
        }
      }
    }
    throw lastError;
  }, []);

  // Generate single audio
  const generateSingleAudio = useCallback(async (text, voiceVal, speedVal, volumeVal, pitchVal) => {
    const response = await fetchWithRetry('http://192.168.23.176:6789/synthesize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        spk_name: voiceVal,
        speed: speedVal,
        volume: volumeVal,
        pitch: pitchVal
      })
    }, 3, 1000);
    return await response.blob();
  }, [fetchWithRetry]);

  // Handle file change
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      try {
        const data = await parseExcelFile(file);
        excelDataRef.current = data;
      } catch (error) {
        setMessage({ text: error.message, type: 'error' });
        excelDataRef.current = null;
      }
    } else {
      setFileName('未选择文件');
      excelDataRef.current = null;
    }
  };

  // Handle Paste Dialog
  const handleOpenPasteDialog = () => setOpenPasteDialog(true);

  const handleClosePasteDialog = () => {
    setOpenPasteDialog(false);
    setPasteContent('');
  };

  const handlePasteConfirm = () => {
    if (!pasteContent.trim()) {
      setMessage({ text: '粘贴内容为空', type: 'error' });
      return;
    }
    try {
      // Manual TSV parsing to ensure robustness with Unicode and avoid library dependencies for simple text
      const rows = pasteContent.trim().split(/\r?\n/);
      if (rows.length < 2) {
        setMessage({ text: '粘贴内容必须包含表头和至少一行数据', type: 'error' });
        return;
      }

      // Parse headers
      const headers = rows[0].split('\t').map(h => h.trim());
      const nameIndex = headers.indexOf('语料名称');
      const textIndex = headers.indexOf('文字内容');

      if (nameIndex === -1 || textIndex === -1) {
        setMessage({ text: '粘贴内容必须包含"语料名称"和"文字内容"列表头', type: 'error' });
        return;
      }

      const validData = [];
      for (let i = 1; i < rows.length; i++) {
        const rowData = rows[i].split('\t');
        // Ensure row has enough columns
        if (rowData.length <= Math.max(nameIndex, textIndex)) continue;

        const name = rowData[nameIndex]?.trim();
        const text = rowData[textIndex]?.trim(); // Note: text might contain quotes if Excel exported it that way, but usually simple copy-paste is raw text.
                                                 // If needed, we could strip surrounding quotes, but usually not needed for simple copy.

        if (name && text) {
          validData.push({
            index: name,
            text: text
          });
        }
      }

      if (validData.length === 0) {
        setMessage({ text: '粘贴内容中没有有效的文本数据', type: 'error' });
        return;
      }

      excelDataRef.current = validData;
      setFileName('已从剪贴板导入数据');
      setMessage({ text: `成功导入 ${validData.length} 条数据`, type: 'success' });
      handleClosePasteDialog();

    } catch (error) {
      setMessage({ text: '解析失败: ' + error.message, type: 'error' });
    }
  };

  // Generate audio
  const handleSynthesize = async () => {
    if (!voice) {
      alert('请选择音色');
      setMessage({ text: '请选择音色', type: 'error' });
      return;
    }

    let data = [];
    if (tabValue === 2) { // Text tab
      const text = textInput.trim();
      if (!text) {
        setMessage({ text: '请输入文本', type: 'error' });
        return;
      }
      const lines = text.split('\n').filter(line => line.trim() !== '');
      if (lines.length === 0) {
        setMessage({ text: '没有有效的文本行', type: 'error' });
        return;
      }
      data = lines.map((line, index) => ({ index: index + 1, text: line }));
    } else if (tabValue === 1) { // Excel tab
      if (!excelDataRef.current) {
        setMessage({ text: '请选择Excel文件', type: 'error' });
        return;
      }
      data = excelDataRef.current;
    } else if (tabValue === 0) { // Baize tab
      if (!baizeDataRef.current) {
        setMessage({ text: '请先导入话术', type: 'error' });
        return;
      }
      data = baizeDataRef.current;
    }

    if (data.length === 0) {
      setMessage({ text: '没有有效的文本数据', type: 'error' });
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    setStatus('准备生成音频...');
    setMessage({ text: '', type: '' });
    setAudioGroups([]);
    mergedAudiosRef.current = {};

    const shouldSplit = splitOption === 'yes';
    let totalSegments = 0;
    data.forEach(item => {
      const segments = shouldSplit ? splitTextIntoSentences(item.text) : [item.text];
      totalSegments += segments.length;
    });

    let processedSegments = 0;
    const newAudioGroups = [];

    try {
      for (let groupIndex = 0; groupIndex < data.length; groupIndex++) {
        const item = data[groupIndex];
        const segments = shouldSplit ? splitTextIntoSentences(item.text) : [item.text];
        
        const audioGroup = {
          index: item.index,
          text: item.text,
          segments: [],
          baizeData: item.baizeData, // Preserve Baize metadata if present
          checked: true, // Default to checked
          isUploaded: false // Track upload status
        };

        for (let segmentIndex = 0; segmentIndex < segments.length; segmentIndex++) {
          const segmentText = segments[segmentIndex];
          setStatus(`正在生成第 ${processedSegments + 1} 个音频片段 (共 ${totalSegments} 个)...`);
          const percent = Math.round((processedSegments / totalSegments) * 100);
          setProgress(percent);

          try {
            const blob = await generateSingleAudio(segmentText, voice, speed, volume, pitch);
            const audioUrl = URL.createObjectURL(blob);
            audioGroup.segments.push({
              text: segmentText,
              blob,
              url: audioUrl,
              played: false
            });
          } catch (error) {
            audioGroup.segments.push({
              text: segmentText,
              error: error.message
            });
          }
          processedSegments++;
        }
        newAudioGroups.push(audioGroup);
        setAudioGroups([...newAudioGroups]);
      }

      setProgress(100);
      setStatus(`音频生成完成! 共生成 ${totalSegments} 个音频片段`);
      setMessage({ text: '所有音频生成完成！', type: 'success' });
    } catch (error) {
      setMessage({ text: `错误: ${error.message}`, type: 'error' });
    } finally {
      setIsGenerating(false);
    }
  };

  // Download all
  const handleDownloadAll = async () => {
    if (audioGroups.length === 0) {
      alert('没有可下载的音频文件');
      return;
    }

    setIsDownloading(true);
    setMessage({ text: '正在打包音频文件...', type: '' });

    try {
      const zip = new JSZip();
      
      for (let groupIndex = 0; groupIndex < audioGroups.length; groupIndex++) {
        if (!mergedAudiosRef.current[groupIndex]) {
          const validSegments = audioGroups[groupIndex].segments.filter(seg => !seg.error);
          if (validSegments.length > 0) {
            const mergedBlob = await mergeAudioSegments(validSegments);
            mergedAudiosRef.current[groupIndex] = { blob: mergedBlob };
          }
        }
        
        if (mergedAudiosRef.current[groupIndex]) {
          const originalAudioFileName = `${audioGroups[groupIndex].index}`;
          const audioFileNameList = originalAudioFileName.split('&');
          audioFileNameList.forEach((audioFileName) => {
            zip.file(`${audioFileName}.wav`, mergedAudiosRef.current[groupIndex].blob);
          });
        }
      }

      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, "完整音频文件.zip");
      setMessage({ text: '音频文件打包下载完成！', type: 'success' });
    } catch (error) {
      setMessage({ text: `打包失败: ${error.message}`, type: 'error' });
    } finally {
      setIsDownloading(false);
    }
  };

  // Export Excel
  const handleExportExcel = () => {
    if (audioGroups.length === 0) return;

    try {
      const data = audioGroups.map(group => ({
        '语料名称': group.index,
        '语料内容': group.segments.map(seg => seg.text).join('')
      }));

      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
      saveAs(blob, "语料导出.xlsx");
      setMessage({ text: 'Excel文件导出成功！', type: 'success' });
    } catch (error) {
      setMessage({ text: `导出Excel失败: ${error.message}`, type: 'error' });
    }
  };

  // Toggle group check
  const handleToggleGroup = useCallback((groupIndex, isChecked) => {
    setAudioGroups(prev => {
      const updated = [...prev];
      if (updated[groupIndex]) {
        updated[groupIndex] = { ...updated[groupIndex], checked: isChecked };
      }
      return updated;
    });
  }, []);

  // Update segment callback
  const handleUpdateSegment = useCallback((groupIndex, segmentIndex, newData) => {
    setAudioGroups(prev => {
      const updated = [...prev];
      if (updated[groupIndex] && updated[groupIndex].segments[segmentIndex]) {
        const hasNewUrl = Object.hasOwn(newData, 'url');
        if (hasNewUrl && updated[groupIndex].segments[segmentIndex].url && newData.url !== updated[groupIndex].segments[segmentIndex].url) {
          URL.revokeObjectURL(updated[groupIndex].segments[segmentIndex].url);
        }

        // Handle recent flag: ensure mutual exclusion across ALL groups (entire page)
        if (Object.hasOwn(newData, 'recent') && newData.recent === true) {
          // First pass: clear recent flag from all segments in all groups
          for (let gIdx = 0; gIdx < updated.length; gIdx++) {
            for (let sIdx = 0; sIdx < updated[gIdx].segments.length; sIdx++) {
              if (updated[gIdx].segments[sIdx].recent) {
                updated[gIdx].segments[sIdx] = { ...updated[gIdx].segments[sIdx], recent: false };
              }
            }
          }
          // Then set the target segment's data including recent flag
          updated[groupIndex].segments[segmentIndex] = {
            ...updated[groupIndex].segments[segmentIndex],
            ...newData
          };
        } else {
          updated[groupIndex].segments[segmentIndex] = {
            ...updated[groupIndex].segments[segmentIndex],
            ...newData
          };
        }

        // Reset uploaded status if content changed (but keep history)
        if (Object.hasOwn(newData, 'text') || Object.hasOwn(newData, 'blob')) {
             updated[groupIndex].isUploaded = false;
        }

        if (hasNewUrl && mergedAudiosRef.current[groupIndex]) {
          delete mergedAudiosRef.current[groupIndex];
        }
      }
      return updated;
    });
  }, []);

  // Delete segment callback
  const handleDeleteSegment = useCallback((groupIndex, segmentIndex) => {
    setAudioGroups(prev => {
      const updated = [...prev];
      if (updated[groupIndex] && updated[groupIndex].segments[segmentIndex]) {
        if (updated[groupIndex].segments[segmentIndex].url) {
          URL.revokeObjectURL(updated[groupIndex].segments[segmentIndex].url);
        }
        updated[groupIndex].segments.splice(segmentIndex, 1);
        if (mergedAudiosRef.current[groupIndex]) {
          delete mergedAudiosRef.current[groupIndex];
        }
        if (updated[groupIndex].segments.length === 0) {
          updated.splice(groupIndex, 1);
        }
      }
      return updated;
    });
    setMessage({ text: '音频片段已删除', type: 'success' });
  }, []);

  // Delete group callback
  const handleDeleteGroup = useCallback((groupIndex) => {
    setAudioGroups(prev => {
      const updated = [...prev];
      if (updated[groupIndex]) {
        updated[groupIndex].segments.forEach(seg => {
          if (seg.url) URL.revokeObjectURL(seg.url);
        });
        if (mergedAudiosRef.current[groupIndex]) {
          delete mergedAudiosRef.current[groupIndex];
        }
        updated.splice(groupIndex, 1);
      }
      return updated;
    });
    setMessage({ text: '音频组已删除', type: 'success' });
  }, []);

  // Update group name callback
  const handleUpdateGroupName = useCallback((groupIndex, newName) => {
      setAudioGroups(prev => {
          const updated = [...prev];
          if (updated[groupIndex]) {
              updated[groupIndex] = { ...updated[groupIndex], index: newName };
          }
          return updated;
      });
  }, []);

  // Regenerate segment
  const handleRegenerateSegment = useCallback(async (groupIndex, segmentIndex, newText) => {
    try {
      const blob = await generateSingleAudio(newText, voice, speed, volume, pitch);
      const audioUrl = URL.createObjectURL(blob);
      handleUpdateSegment(groupIndex, segmentIndex, {
        text: newText,
        blob,
        url: audioUrl,
        error: undefined,
        played: false
      });
      setMessage({ text: '音频片段重新生成成功！', type: 'success' });
    } catch (error) {
      setMessage({ text: `重新生成音频失败: ${error.message}`, type: 'error' });
      throw error;
    }
  }, [voice, speed, volume, pitch, generateSingleAudio, handleUpdateSegment]);

  // Generate test audio for testing
  const handleAddTestData = useCallback(() => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const sampleRate = 8000;
      const segmentDefs = [
        { type: 'tone', freq: 440, duration: 2 },
        { type: 'sweep', from: 220, to: 880, duration: 2 }
      ];

      const segments = segmentDefs.map(def => {
        const duration = def.duration || 1;
        const numSamples = Math.floor(sampleRate * duration);
        const buffer = audioContext.createBuffer(1, numSamples, sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < numSamples; i++) {
          const t = i / sampleRate;
          let sample = 0;
          if (def.type === 'tone') {
            sample = 0.6 * Math.sin(2 * Math.PI * def.freq * t);
          } else if (def.type === 'sweep') {
            const freq = def.from + (def.to - def.from) * (t / duration);
            sample = 0.6 * Math.sin(2 * Math.PI * freq * t);
          }
          data[i] = Math.max(-1, Math.min(1, sample));
        }

        const wavBlob = bufferToWave(buffer, buffer.length);
        const url = URL.createObjectURL(wavBlob);
        return {
          text: `测试片段 ${def.type} (${def.duration}s)`,
          blob: wavBlob,
          url,
          played: false
        };
      });

      const newGroup = {
        index: `测试语料-${Date.now()}`,
        text: '测试用语料（自动生成）',
        segments,
        baizeData: {
            id: `test-id-${Date.now()}`,
            text: '测试用语料（自动生成）',
            originalData: { isPlay: false }
        },
        isUploaded: false,
        hasUploadedHistory: false
      };

      setAudioGroups(prev => [newGroup, ...prev]);
      // Set baizeDataRef to fake valid state for progress bar
      if (!baizeDataRef.current) {
          baizeDataRef.current = [{ id: 'test', text: 'test' }];
      }
      setMessage({ text: '已添加测试数据', type: 'success' });
    } catch (error) {
      setMessage({ text: `生成测试数据失败: ${error.message}`, type: 'error' });
    }
  }, [setAudioGroups, setMessage]);

  const showProgress = audioGroups.length > 0 && baizeDataRef.current;

  return (
      <Container maxWidth="xl" sx={{ py: 3 }}>
          {/* <Grid container spacing={3} justifyContent="center"> */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                gap: 3,
                px: 3,
                py: 3,
                minWidth: 1200,        // 👈 整个页面的“安全宽度”
                flexWrap: 'nowrap',   // 👈 关键：禁止换行
                // overflowX: 'auto',     // 👈 屏幕太小就横向滚
                // overflowY: 'visible'

              }}
            >
              {/* Login/User Menu Button */}
              <Box sx={{ position: 'absolute', top: 20, right: 20, zIndex: 1000 }}>
                  {!user ? (
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<LoginIcon />}
                        onClick={handleLoginOpen}
                        sx={{ borderRadius: 20 }}
                      >
                          登录
                      </Button>
                  ) : (
                      <>
                          <Box
                              onClick={handleOpenUserMenu}
                              sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 1,
                                  bgcolor: 'white',
                                  p: 1,
                                  px: 2,
                                  borderRadius: 20,
                                  boxShadow: 1,
                                  cursor: 'pointer',
                                  transition: 'all 0.2s',
                                  '&:hover': {
                                      bgcolor: '#f5f5f5',
                                      boxShadow: 2
                                  }
                              }}
                          >
                              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                  {user.account}
                              </Typography>
                              <KeyboardArrowDownIcon color="action" />
                          </Box>
                          <Menu
                              sx={{ mt: '45px' }}
                              id="menu-appbar"
                              anchorEl={anchorElUser}
                              anchorOrigin={{
                                  vertical: 'top',
                                  horizontal: 'right',
                              }}
                              keepMounted
                              transformOrigin={{
                                  vertical: 'top',
                                  horizontal: 'right',
                              }}
                              open={Boolean(anchorElUser)}
                              onClose={handleCloseUserMenu}
                          >
                              <MenuItem disabled>
                                  <Typography variant="caption" display="block" gutterBottom>
                                      {workspaceInfo ? (
                                        <>
                                            {new Date(workspaceInfo.timestamp).toLocaleString()}
                                            <br />
                                            已保存 {workspaceInfo.count} 条语料
                                        </>
                                      ) : '暂无保存记录'}
                                  </Typography>
                              </MenuItem>
                              <Divider />
                              <MenuItem onClick={handleLogout}>
                                  <ListItemIcon>
                                      <LogoutIcon fontSize="small" />
                                  </ListItemIcon>
                                  <ListItemText>退出登录</ListItemText>
                              </MenuItem>
                              <Divider />
                              <MenuItem onClick={handleClearWorkspace} sx={{ color: 'error.main' }}>
                                  <ListItemIcon>
                                      <DeleteIcon fontSize="small" color="error" />
                                  </ListItemIcon>
                                  <ListItemText>删除工作区</ListItemText>
                              </MenuItem>
                          </Menu>
                      </>
                  )}
              </Box>

            {/* <Grid item xs={12} md={5}> */}
                <Paper
                  sx={{
                    p: 3,
                    position: 'sticky',
                    top: 24,
                    maxHeight: 400, // 👈 关键
                    maxWidth: 350,
                    overflowY: 'auto',
                    '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: 'linear-gradient(90deg, #6C5CE7, #00CEC9)',
                  }
                  }}
                >
                  <Typography variant="h6" gutterBottom>
                    运用文字：
                  </Typography>

                  <Typography variant="body1">
                    1、加入承接词、语气助词，让合成更自然
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ whiteSpace: 'pre-line' }}
                  >
                    <br></br>
                    {contentLeft}
                  </Typography>
                </Paper>
            {/* </Grid> */}

            {/* <Grid item xs={12} md={7} display="flex" justifyContent="center"> */}
              <Paper 
                elevation={3} 
                sx={{ 
                  p: 3, 
                  borderRadius: 4,
                  // position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: 'linear-gradient(90deg, #6C5CE7, #00CEC9)',
                  }
                }}
              >
                <Typography 
                  variant="h4" 
                  component="h1" 
                  align="center" 
                  sx={{ 
                    mb: 1, 
                    fontWeight: 700,
                    '&::after': {
                      content: '""',
                      display: 'block',
                      width: '60px',
                      height: '3px',
                      background: 'linear-gradient(90deg, #6C5CE7, #00CEC9)',
                      margin: '12px auto',
                      borderRadius: '2px'
                    }
                  }}
                >
                  语音合成
                </Typography>

                <Typography 
                  align="center" 
                  color="text.secondary" 
                  sx={{ mb: 3, maxWidth: '600px', mx: 'auto' }}
                >
                  输入文本或上传Excel文件，每行文本可按句号、问号分割成独立的音频片段，打包导出时会自动合并为完整音频
                </Typography>

                {/* Controls Grid */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <FormControl fullWidth size="small">
                      <InputLabel>音色选择 <span style={{ color: 'red' }}>[请勿选错]</span></InputLabel>
                      <Select
                        value={voice}
                        label="音色选择 [请勿选错]"
                        onChange={(e) => setVoice(e.target.value)}
                      >
                        {voiceOptions.map(opt => (
                          <MenuItem key={opt.value} value={opt.value} disabled={opt.value === ''}>
                            {opt.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <FormControl fullWidth size="small">
                      <InputLabel>语速调节</InputLabel>
                      <Select value={speed} label="语速调节" onChange={(e) => setSpeed(e.target.value)}>
                        {speedOptions.map(opt => (
                          <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <FormControl fullWidth size="small">
                      <InputLabel>音量控制</InputLabel>
                      <Select value={volume} label="音量控制" onChange={(e) => setVolume(e.target.value)}>
                        {volumeOptions.map(opt => (
                          <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <FormControl fullWidth size="small">
                      <InputLabel>音调控制</InputLabel>
                      <Select value={pitch} label="音调控制" onChange={(e) => setPitch(e.target.value)}>
                        {pitchOptions.map(opt => (
                          <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <FormControl fullWidth size="small">
                      <InputLabel>文本分割</InputLabel>
                      <Select value={splitOption} label="文本分割" onChange={(e) => setSplitOption(e.target.value)}>
                        <MenuItem value="yes">是（将按句号/问号分片）</MenuItem>
                        <MenuItem value="no">否（将整段合成）</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>

                {/* Tabs */}
                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                  <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} centered>
                    <Tab icon={<CloudDownloadIcon />} iconPosition="start" label="从白泽导入" />
                    <Tab icon={<UploadFileIcon />} iconPosition="start" label="Excel文件批量合成" />
                    <Tab icon={<KeyboardIcon />} iconPosition="start" label="输入文本逐行合成" />
                  </Tabs>
                </Box>

                {/* Tab Panels */}
                <Box sx={{ mb: 3 }}>
                  {tabValue === 0 && (
                     <Box sx={{
                      p: 3,
                      bgcolor: 'rgba(108, 92, 231, 0.03)',
                      borderRadius: 2,
                      border: '1px dashed',
                      borderColor: 'primary.light'
                    }}>
                       <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        从白泽系统导入话术语料作为编辑器初始内容。
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                          <Button
                              variant="contained"
                              startIcon={<CloudDownloadIcon />}
                              onClick={handleOpenScriptDialog}
                              sx={{ px: 4 }}
                          >
                              导入话术内容
                          </Button>
                      </Box>
                    </Box>
                  )}

                  {tabValue === 1 && (
                    <Box sx={{ 
                      p: 3, 
                      bgcolor: 'rgba(108, 92, 231, 0.03)', 
                      borderRadius: 2,
                      border: '1px dashed',
                      borderColor: 'primary.light'
                    }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        请上传包含"语料名称"、"文字内容"列的Excel文件，支持xlsx格式
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                          <Button
                            variant="contained"
                            startIcon={<ContentPasteIcon />}
                            onClick={handleOpenPasteDialog}
                            sx={{ whiteSpace: 'nowrap' }}
                          >
                            从剪贴板粘贴
                          </Button>
                          <Button
                            variant="contained"
                            component="label"
                            startIcon={<UploadFileIcon />}
                            sx={{ whiteSpace: 'nowrap' }}
                          >
                            点此选择xlsx文件
                            <input
                              type="file"
                              hidden
                              accept=".xlsx,.xls"
                              ref={fileInputRef}
                              onChange={handleFileChange}
                            />
                          </Button>
                          <Box sx={{
                            flex: 1,
                            p: 1.5,
                            bgcolor: 'white',
                            borderRadius: 2,
                            border: '1px solid',
                            borderColor: 'divider'
                          }}>
                            {fileName}
                          </Box>
                        </Box>
                        
                      </Box>
                    </Box>
                  )}
                  {tabValue === 2 && (
                    <Box sx={{ 
                      p: 3, 
                      bgcolor: 'rgba(108, 92, 231, 0.03)', 
                      borderRadius: 2,
                      border: '1px dashed',
                      borderColor: 'primary.light'
                    }}>
                      <TextField
                        multiline
                        rows={6}
                        fullWidth
                        placeholder={`请输入文本，一行一个文本，每个文本可按句号、问号分割成片段...\n例如：\n这是第一行文本。\n这是第二行文本。`}
                        value={textInput}
                        onChange={(e) => setTextInput(e.target.value)}
                      />
                    </Box>
                  )}
                </Box>

                {/* Global Action Buttons */}
                <Box sx={{ mb: 3 }}>
                   {/* Row 1: Synthesis Button (Centered) */}
                   <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                     <Button
                      variant="contained"
                      size="medium"
                      startIcon={isGenerating ? <CircularProgress size={20} color="inherit" /> : <BoltIcon />}
                      onClick={handleSynthesize}
                      disabled={isGenerating}
                      className={!isGenerating ? 'pulse-animation' : ''}
                      sx={{
                        borderRadius: '8px',
                        fontWeight: 'bold',
                        boxShadow: '0 4px 14px 0 rgba(108, 92, 231, 0.39)',
                        background: 'linear-gradient(45deg, #6C5CE7 30%, #a29bfe 90%)',
                      }}
                    >
                      {isGenerating ? '生成中...' : '开始逐个合成音频'}
                    </Button>
                   </Box>

                  {/* Row 2: Export and Upload Buttons */}
                  <Grid container spacing={2}>
                     <Grid size={4}>
                        <Button
                            fullWidth
                            variant="contained"
                            color="secondary"
                            startIcon={isDownloading ? <CircularProgress size={20} color="inherit" /> : <DownloadIcon />}
                            onClick={handleDownloadAll}
                            disabled={audioGroups.length === 0 || isDownloading}
                            sx={{ borderRadius: '8px', py: 1 }}
                        >
                            {isDownloading ? '打包中...' : '打包导出所有音频'}
                        </Button>
                     </Grid>
                     <Grid size={4}>
                         <Button
                            fullWidth
                            variant="contained"
                            color="info" // Using info or secondary for visual distinction
                            startIcon={<DescriptionIcon />}
                            onClick={handleExportExcel}
                            disabled={audioGroups.length === 0 || isGenerating}
                             sx={{ borderRadius: '8px', py: 1 }}
                         >
                             导出Excel文件
                         </Button>
                     </Grid>
                     <Grid size={4}>
                         <Button
                            fullWidth
                            variant="contained"
                            color="success"
                            startIcon={isUploading ? <CircularProgress size={20} color="inherit" /> : <CloudUploadIcon />}
                            onClick={handleBatchUploadClick}
                            disabled={isUploading}
                             sx={{ borderRadius: '8px', py: 1 }}
                        >
                            {isUploading ? '正在上传...' : '批量上传到白泽'}
                        </Button>
                     </Grid>
                  </Grid>
                </Box>

                {/* Progress */}
                <Box sx={{ 
                  p: 2, 
                  bgcolor: '#F8F9FA', 
                  borderRadius: 2, 
                  border: '1px solid',
                  borderColor: 'divider',
                  mb: 2
                }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" fontWeight={600}>{status}</Typography>
                    <Typography variant="body2" color="text.secondary">{progress}%</Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={progress} 
                    sx={{ 
                      height: 8, 
                      borderRadius: 4,
                      '& .MuiLinearProgress-bar': {
                        background: 'linear-gradient(90deg, #6C5CE7, #00CEC9)'
                      }
                    }} 
                  />
                </Box>

                {/* Message */}
                {message.text && (
                  <Alert 
                    severity={message.type === 'error' ? 'error' : 'success'} 
                    sx={{ mb: 2 }}
                    onClose={() => setMessage({ text: '', type: '' })}
                  >
                    {message.text}
                  </Alert>
                )}

                {/* Audio List */}
                <Box>
                  {audioGroups.map((group, groupIndex) => (
                    <AudioGroup
                      key={`group-${groupIndex}`}
                      group={group}
                      groupIndex={groupIndex}
                      voice={voice}
                      checked={group.checked}
                      onToggle={(val) => handleToggleGroup(groupIndex, val)}
                      onDeleteGroup={handleDeleteGroup}
                      onDeleteSegment={handleDeleteSegment}
                      onUpdateSegment={handleUpdateSegment}
                      onRegenerateSegment={handleRegenerateSegment}
                      onUploadGroup={handleSingleGroupUpload}
                      onUpdateGroupName={handleUpdateGroupName}
                      mergeAudioSegments={mergeAudioSegments}
                      mergedAudiosRef={mergedAudiosRef}
                      setMessage={setMessage}
                      isGlobalUploading={uploadingGroupIndices.has(groupIndex)}
                    />
                  ))}
                </Box>
              </Paper>
            {/* </Grid> */}

             {/* Help FAB */}
             <Fab
                color="info"
                aria-label="help"
                onClick={() => setHelpDialogOpen(true)}
                sx={{
                    position: 'fixed',
                    bottom: showProgress ? 300 : 200,
                    right: 40,
                    zIndex: 1000,
                    boxShadow: '0 8px 16px rgba(9, 132, 227, 0.4)',
                    transition: 'bottom 0.3s ease',
                    background: 'linear-gradient(45deg, #0984e3, #74b9ff)',
                    '&:hover': {
                        transform: 'scale(1.1)',
                        boxShadow: '0 12px 20px rgba(9, 132, 227, 0.5)'
                    }
                }}
             >
                <HelpIcon />
             </Fab>

             {/* Test Data FAB */}
             <Fab
                color="primary"
                aria-label="add test data"
                onClick={handleAddTestData}
                sx={{
                    position: 'fixed',
                    bottom: showProgress ? 220 : 120,
                    right: 40,
                    zIndex: 1000,
                    boxShadow: '0 8px 16px rgba(108, 92, 231, 0.4)',
                    transition: 'bottom 0.3s ease',
                    background: 'linear-gradient(45deg, #6C5CE7, #a29bfe)',
                    '&:hover': {
                        transform: 'scale(1.1)',
                        boxShadow: '0 12px 20px rgba(108, 92, 231, 0.5)'
                    }
                }}
             >
                <ScienceIcon />
             </Fab>

             {/* Floating Progress Bar */}
             {audioGroups.length > 0 && baizeDataRef.current && (
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
                        animation: 'slideInRight 0.5s ease-out'
                    }}
                >
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', mr: 1 }}>
                        <Typography variant="body2" component="div" sx={{ fontWeight: 'bold' }}>
                            目标话术：
                            <Typography
                                component="span"
                                variant="body2"
                                onClick={handleLinkScript}
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
                                onChange={(e) => setSyncTextEnabled(e.target.checked)}
                                inputProps={{ 'aria-label': 'sync text switch' }}
                            />
                        </Box>
                    </Box>

                    <Divider orientation="vertical" flexItem sx={{ height: 40, alignSelf: 'center' }} />

                    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                        <CircularProgress
                            variant="determinate"
                            value={(audioGroups.filter(g => g.isUploaded).length / audioGroups.length) * 100}
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
                                {Math.round((audioGroups.filter(g => g.isUploaded).length / audioGroups.length) * 100)}%
                            </Typography>
                        </Box>
                    </Box>
                    <Box>
                        <Typography variant="subtitle2" fontWeight="bold">
                            上传进度
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {audioGroups.filter(g => g.isUploaded).length} / {audioGroups.length}
                        </Typography>
                    </Box>
                </Box>
            )}
          
            {/* <Grid item xs={12} md={5}> */}
                <Paper
                  sx={{
                    p: 3,
                    position: 'sticky',
                    top: 24,
                    maxHeight: 500, // 👈 关键
                    maxWidth: 350,
                    overflowY: 'auto',
                    '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: 'linear-gradient(90deg, #6C5CE7, #00CEC9)',
                  }}
                  }
                >
                  <Typography variant="h6" gutterBottom>
                    运用文字：
                  </Typography>

                  <Typography variant="body1">
                    2、注意多音字
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ whiteSpace: 'pre-line' }}
                  >
                    {contentRight1}
                    <br></br>
                  </Typography>

                  <Typography variant="body1">
                    3、带流程的重要环节，担心合成读的太快，可以加上：
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ whiteSpace: 'pre-line' }}
                  >
                    {contentRight2}
                    <br></br>
                  </Typography>

                  <Typography variant="body1">
                    运用标点符号
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ whiteSpace: 'pre-line' }}
                  >
                    {contentRight3}
                    <br></br>
                  </Typography>
                </Paper>
            {/* </Grid> */}

          {/* </Grid> */}
          </Box>

          <Dialog open={openPasteDialog} onClose={handleClosePasteDialog} maxWidth="md" fullWidth>
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
              <Button onClick={handleClosePasteDialog}>取消</Button>
              <Button onClick={handlePasteConfirm} variant="contained">确认导入</Button>
            </DialogActions>
          </Dialog>

          {/* Login Dialog */}
          <Dialog open={loginOpen} onClose={handleLoginClose}>
            <DialogTitle>登录白泽系统</DialogTitle>
            <DialogContent sx={{ pt: 2, minWidth: 300 }}>
                <TextField
                    autoFocus
                    margin="dense"
                    label="用户名"
                    type="text"
                    fullWidth
                    variant="outlined"
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    sx={{ mb: 2 }}
                />
                <TextField
                    margin="dense"
                    label="密码"
                    type="password"
                    fullWidth
                    variant="outlined"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={handleLoginClose}>取消</Button>
                <Button onClick={handleLoginSubmit} variant="contained">登录</Button>
            </DialogActions>
          </Dialog>

          {/* Script Selection Dialog */}
          <Dialog
            open={scriptDialogOpen}
            onClose={() => {
                setScriptDialogOpen(false);
                // Clean up uploading state if cancelled during single upload flow
                if (scriptDialogMode === 'single_upload' && singleUploadGroupIndex !== null) {
                    setUploadingGroupIndices(prev => {
                        const newSet = new Set(prev);
                        newSet.delete(singleUploadGroupIndex);
                        return newSet;
                    });
                    setSingleUploadGroupIndex(null);
                }
            }}
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
                        value={scriptSearch}
                        onChange={(e) => setScriptSearch(e.target.value)}
                        placeholder="输入关键词筛选..."
                    />
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={syncTextEnabled}
                                onChange={(e) => setSyncTextEnabled(e.target.checked)}
                            />
                        }
                        label="同步文本内容"
                    />
                </Box>
                {isFetchingScripts ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <List sx={{ pt: 0, maxHeight: '400px', overflow: 'auto' }}>
                        {scriptList.filter(s => s.scriptName.toLowerCase().includes(scriptSearch.toLowerCase())).length > 0 ? (
                            scriptList
                                .filter(s => s.scriptName.toLowerCase().includes(scriptSearch.toLowerCase()))
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
                                          onClick={() => handleScriptSelect(script)}
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
                <Button onClick={() => setScriptDialogOpen(false)}>取消</Button>
                <Button onClick={handleScriptDialogConfirm} variant="contained" disabled={!selectedScript}>
                  确定
                </Button>
            </DialogActions>
          </Dialog>

          {/* Result Dialog */}
          <Dialog open={resultDialogOpen} onClose={() => setResultDialogOpen(false)}>
            <DialogTitle>操作结果提示</DialogTitle>
            <DialogContent>
                <Typography>{resultDialogMessage}</Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setResultDialogOpen(false)} autoFocus>确定</Button>
            </DialogActions>
          </Dialog>

          {/* Corpus Selection Dialog */}
          <Dialog open={corpusDialogOpen} onClose={() => setCorpusDialogOpen(false)} maxWidth="lg" fullWidth>
            <DialogTitle>选择语料</DialogTitle>
            <DialogContent>
                <Box sx={{ mb: 2, mt: 1 }}>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                        当前话术: {tempScript?.scriptName}
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

                    {/* Filter Actions and List Logic */}
                    {(() => {
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

                        return (
                            <>
                                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                                    <Button variant="contained" size="small" onClick={handleSelectCurrent}>
                                        追选当前
                                    </Button>
                                    <Button variant="contained" size="small" onClick={handleClearAll}>
                                        全部清空
                                    </Button>
                                </Box>

                                <List sx={{ pt: 0, maxHeight: '400px', overflow: 'auto', borderTop: '1px solid #eee' }}>
                                    {filteredCorpus.length > 0 ? (
                                        filteredCorpus.map((item) => {
                                            const getStatusLabel = (status) => {
                                                switch(status) {
                                                    case '0': return '未验听';
                                                    case '1': return '已验听';
                                                    case '2': return '已标记';
                                                    default: return '未知';
                                                }
                                            };
                                            const getStatusColor = (status) => {
                                                 switch(status) {
                                                    case '0': return 'default';
                                                    case '1': return 'success';
                                                    case '2': return 'error'; // Marked often implies issue or special attention
                                                    default: return 'default';
                                                }
                                            };

                                            return (
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
                                            );
                                        })
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
                            </>
                        );
                    })()}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setCorpusDialogOpen(false)}>取消</Button>
                <Button onClick={handleCorpusConfirm} variant="contained">确定</Button>
            </DialogActions>
          </Dialog>

          {/* Help Dialog */}
          <Dialog open={helpDialogOpen} onClose={() => setHelpDialogOpen(false)}>
            <DialogTitle>功能说明</DialogTitle>
            <DialogContent>
                <List>
                    <ListItem>
                        <ListItemIcon>
                            <CloudUploadIcon color="success" />
                        </ListItemIcon>
                        <ListItemText
                            primary="上传音频 (绿色)"
                            secondary="将合成的音频合并并上传到白泽系统，同时更新话术文本。"
                        />
                    </ListItem>
                    <ListItem>
                        <ListItemIcon>
                            <DeleteIcon color="warning" />
                        </ListItemIcon>
                        <ListItemText
                            primary="删除音频组 (黄色)"
                            secondary="从编辑器中移除当前语料组及其所有片段。"
                        />
                    </ListItem>
                    <ListItem>
                        <ListItemIcon>
                            <PlayArrowIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText
                            primary="播放完整音频"
                            secondary="按顺序播放当前语料组的所有音频片段。"
                        />
                    </ListItem>
                    <ListItem>
                        <ListItemIcon>
                            <DownloadIcon color="secondary" />
                        </ListItemIcon>
                        <ListItemText
                            primary="下载完整音频"
                            secondary="将当前语料组的所有片段合并为一个WAV文件并下载。"
                        />
                    </ListItem>
                    <ListItem>
                        <ListItemIcon>
                            <ScienceIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText
                            primary="添加测试数据"
                            secondary="生成模拟的语料和音频数据，用于测试界面功能。"
                        />
                    </ListItem>
                </List>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setHelpDialogOpen(false)} autoFocus>关闭</Button>
            </DialogActions>
          </Dialog>
      </Container>
  );
}

export default TtsEditor;
