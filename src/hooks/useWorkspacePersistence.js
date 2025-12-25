import { useState, useEffect, useRef, useCallback } from 'react';
import { workspaceStorage } from '../utils/workspaceStorage';

export function useWorkspacePersistence({
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
}) {
  const [workspaceInfo, setWorkspaceInfo] = useState(null);
  const [isRestoring, setIsRestoring] = useState(true);

  // Ref to track if initial load is done to prevent overwriting with empty state
  const isLoadedRef = useRef(false);

  // Load workspace on mount
  useEffect(() => {
    const load = async () => {
      try {
        const data = await workspaceStorage.loadWorkspace();
        if (data) {
          if (data.audioGroups) setAudioGroups(data.audioGroups);
          if (data.textInput !== undefined) setTextInput(data.textInput);
          if (data.targetScript) setTargetScript(data.targetScript);
          if (data.tabValue !== undefined) setTabValue(data.tabValue);

          // Try to restore refs if data structure allows (optional, but good for UX)
          // Since refs are not state, we can set them directly.
          // However, baizeDataRef usually comes from targetScript loading or file input.
          // If we saved the "source data" in DB, we could restore it.
          // Current DB schema saves audioGroups (which has baizeData inside).
          // But baizeDataRef is used for generating NEW groups.
          // Let's rely on the fact that restored groups have their own baizeData.

          setWorkspaceInfo({
            timestamp: data.timestamp,
            count: data.count
          });
        }
      } catch (error) {
        console.error("Error loading workspace:", error);
      } finally {
        isLoadedRef.current = true;
        setIsRestoring(false);
      }
    };
    load();
  }, [setAudioGroups, setTextInput, setTargetScript, setTabValue]);

  // Save workspace on changes (debounced)
  useEffect(() => {
    if (!isLoadedRef.current) return;

    const saveData = async () => {
      const dataToSave = {
        audioGroups,
        textInput,
        targetScript,
        tabValue
      };

      try {
        await workspaceStorage.saveWorkspace(dataToSave);
        // Update info state locally to reflect latest save
        setWorkspaceInfo({
            timestamp: Date.now(),
            count: audioGroups ? audioGroups.length : 0
        });
      } catch (error) {
        console.error("Error saving workspace:", error);
      }
    };

    const timeoutId = setTimeout(saveData, 2000); // 2 second debounce

    return () => clearTimeout(timeoutId);
  }, [audioGroups, textInput, targetScript, tabValue]);

  const clearWorkspace = useCallback(async () => {
    try {
      await workspaceStorage.clearWorkspace();
      // Clear State
      setAudioGroups([]);
      setTextInput('');
      setTargetScript(null);
      // setTabValue(0); // Optional: reset tab? Maybe keep it.

      setWorkspaceInfo(null);

      // Also clear refs if possible?
      // Refs are passed as props, we can mutate them since they are objects/refs.
      if (baizeDataRef) baizeDataRef.current = null;
      if (excelDataRef) excelDataRef.current = null;

    } catch (error) {
      console.error("Error clearing workspace:", error);
    }
  }, [setAudioGroups, setTextInput, setTargetScript, baizeDataRef, excelDataRef]);

  return {
    workspaceInfo,
    clearWorkspace,
    isRestoring
  };
}
