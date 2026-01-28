import { useState, useCallback } from 'react';
import { lockScript, unlockScript, uploadAudio, updateScriptText } from '../utils/baizeApi';
import { findMatchedCorpus } from '../utils/corpusUtils';
import { mergeAudioSegments } from '../utils/audioUtils';
import { logAction, ActionTypes } from '../utils/logger';

/**
 * Hook to manage the Single Upload workflow for audio groups.
 *
 * @param {Object} params - The hook parameters.
 * @param {string} params.token - The user's authentication token.
 * @param {Array} params.audioGroups - The current list of audio groups.
 * @param {Function} params.setAudioGroups - State setter for audio groups.
 * @param {Object} params.mergedAudiosRef - Ref to store merged audio blobs.
 * @param {Object} params.targetScript - The currently selected target script for context.
 * @param {Array} params.targetScriptCorpusList - The corpus list for the target script.
 * @param {boolean} params.syncTextEnabled - Whether to sync text changes during upload.
 * @param {Function} params.setMessage - Function to set UI messages (toast/alert).
 * @param {Function} params.handleLoginOpen - Function to open the login dialog.
 * @param {Function} params.openScriptDialog - Function to open the script selection dialog with a specific mode.
 */
export const useSingleUpload = ({
  token,
  audioGroups,
  setAudioGroups,
  mergedAudiosRef,
  targetScript,
  targetScriptCorpusList,
  syncTextEnabled,
  setMessage,
  handleLoginOpen,
  openScriptDialog
}) => {
  const [singleUploadGroupIndex, setSingleUploadGroupIndex] = useState(null);
  const [hasConfirmedSingleUploadScript, setHasConfirmedSingleUploadScript] = useState(false);
  const [uploadingGroupIndices, setUploadingGroupIndices] = useState(new Set());

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
      const matchedCorpus = findMatchedCorpus(group, activeCorpusList);

      if (!matchedCorpus) {
          setMessage({ text: `无法上传: 当前语料名称 "${group.index}" (或ID/内容) 不在目标话术 "${activeScript.scriptName}" 中`, type: 'error' });
          setUploadingGroupIndices(prev => {
              const newSet = new Set(prev);
              newSet.delete(groupIndex);
              return newSet;
          });
          return;
      }

      // Try to merge if valid segments exist
      let mergedBlob = null;
      if (mergedAudiosRef.current && mergedAudiosRef.current[groupIndex]) {
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

          // Iterate over all targets
          const targets = matchedCorpus.baizeTargets || [matchedCorpus.baizeData];
          let successCount = 0;
          let failCount = 0;
          let locked = false;

          for (const target of targets) {
              const contentId = target.id;
              // Use specific corpus name if available, otherwise fallback to group index (which might be aggregated)
              const specificName = target.originalData?.contentName || group.index;
              const filename = `${specificName}.wav`;

              try {
                  const res = await uploadAudio(token, contentId, mergedBlob, filename);

                  if (res && res.code === "2000") {
                      if (isTextChanged && syncTextEnabled) {
                          const corpusId = target.corpusId;
                          await updateScriptText(token, contentId, corpusId, activeScript.id, currentFullText);
                      }
                      successCount++;
                  } else if (res && (res.code === "666" || (res.msg && res.msg.includes('锁定')))) {
                      locked = true;
                      failCount++;
                  } else {
                      failCount++;
                  }
              } catch (e) {
                  console.error(`Single upload failed for target ${contentId}`, e);
                  if (e.message && e.message.includes('锁定')) locked = true;
                  failCount++;
              }
          }

          if (successCount > 0 && failCount === 0) {
               // Mark as uploaded
              setAudioGroups(prev => {
                  const updated = [...prev];
                  updated[groupIndex] = {
                    ...updated[groupIndex],
                    isUploaded: true,
                    hasUploadedHistory: true, // Mark history
                    baizeData: matchedCorpus.baizeData,
                    baizeTargets: matchedCorpus.baizeTargets // Persist targets
                  };
                  return updated;
              });

              logAction(ActionTypes.UPLOAD_SINGLE, {
                  groupName: group.index,
                  scriptId: activeScript.id,
                  targets: targets.length
              }, 'success');

              setMessage({ text: `上传成功: ${group.index} (同步 ${targets.length} 个目标)`, type: 'success' });
          } else {
              const msg = locked ? '部分或全部语料被锁定' : '上传存在失败';
              setMessage({ text: `上传完成: 成功 ${successCount}/${targets.length}, 失败 ${failCount} (${msg})`, type: failCount > 0 ? 'warning' : 'success' });
          }

      } catch (error) {
          logAction(ActionTypes.UPLOAD_SINGLE, {
              groupName: group.index,
              error: error.message
          }, 'error');
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
  }, [audioGroups, token, syncTextEnabled, mergedAudiosRef, setAudioGroups, setMessage]);

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
        try {
            await openScriptDialog('single_upload'); // Delegated to parent via callback
        } catch (e) {
            // If fetch fails, we need to clear the uploading state
            setUploadingGroupIndices(prev => {
                const newSet = new Set(prev);
                newSet.delete(groupIndex);
                return newSet;
            });
        }
        return;
    }

    // If confirmed, proceed immediately using current targetScript and list
    executeSingleUpload(groupIndex, targetScript, targetScriptCorpusList);

  }, [token, targetScript, hasConfirmedSingleUploadScript, targetScriptCorpusList, executeSingleUpload, handleLoginOpen, setMessage, openScriptDialog]);

  // Handler for confirmation from Script Dialog
  const handleSingleUploadConfirm = useCallback((selectedScript, corpusList) => {
      setHasConfirmedSingleUploadScript(true); // Mark as confirmed

      if (singleUploadGroupIndex !== null) {
          executeSingleUpload(singleUploadGroupIndex, selectedScript, corpusList);
          setSingleUploadGroupIndex(null);
      }
  }, [singleUploadGroupIndex, executeSingleUpload]);

  return {
      singleUploadGroupIndex,
      setSingleUploadGroupIndex,
      hasConfirmedSingleUploadScript,
      setHasConfirmedSingleUploadScript,
      uploadingGroupIndices,
      setUploadingGroupIndices,
      handleSingleGroupUpload,
      handleSingleUploadConfirm
  };
};
