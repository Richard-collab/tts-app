import React, { useRef, useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import { Popover, Box, TextField, Button } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const RichTextEditor = forwardRef(({ value, onChange, onBlur, onFocus, voice, onAutoSave }, ref) => {
  const editorRef = useRef(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [editingPill, setEditingPill] = useState(null);
  const [durationInput, setDurationInput] = useState('1.0');

  // Store the last known range selection for this editor
  const lastRangeRef = useRef(null);

  // --- HTML <-> Text Conversion ---

  // Convert raw text to HTML with visual pills
  const textToHtml = (text) => {
    if (!text) return '';
    let html = text
      // Escape HTML characters to prevent XSS (basic)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      // Restore specific tags we want to visualize
      .replace(/&lt;break time="(\d+)ms"\/?&gt;/g, (match, ms) => {
        const sec = (parseInt(ms) / 1000).toFixed(1);
        return `<span class="pause-pill" contenteditable="false" data-duration="${sec}"> 停顿 ${sec}s</span>`;
      })
      .replace(/&lt;#([\d.]+)#&gt;/g, (match, sec) => {
        const duration = parseFloat(sec).toFixed(1);
        return `<span class="pause-pill" contenteditable="false" data-duration="${duration}"> 停顿 ${duration}s</span>`;
      });

    // Handle newlines
    html = html.replace(/\n/g, '<br>');
    return html;
  };

  // Convert HTML back to raw text based on current voice
  const htmlToText = (htmlElement) => {
    let text = '';

    // Recursive traversal to handle text nodes and pills
    const traverse = (node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        text += node.textContent;
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        if (node.classList.contains('pause-pill')) {
          const duration = parseFloat(node.getAttribute('data-duration') || '1.0');
          // Generate tag based on voice
          if (voice && voice.includes('MinMax')) {
            text += `<#${duration.toFixed(1)}#>`;
          } else if (voice && voice.includes('阿里')) {
            const ms = Math.round(duration * 1000);
            text += `<break time="${ms}ms"/>`;
          } else {
             // Fallback default
             text += `<#${duration.toFixed(1)}#>`;
          }
        } else if (node.tagName === 'BR') {
          text += '\n';
        } else if (node.tagName === 'DIV') {
            if (text.length > 0 && !text.endsWith('\n')) text += '\n';
            node.childNodes.forEach(traverse);
        } else {
          node.childNodes.forEach(traverse);
        }
      }
    };

    htmlElement.childNodes.forEach(traverse);
    return text;
  };

  // --- Effects ---

  // Effect 1: Sync Value -> InnerHTML
  // Only update if the semantic text content has changed from parent
  useEffect(() => {
    if (editorRef.current) {
        const currentText = htmlToText(editorRef.current);
        if (value !== currentText) {
             const newHtml = textToHtml(value);
             if (editorRef.current.innerHTML !== newHtml) {
                 editorRef.current.innerHTML = newHtml;
             }
        }
    }
  }, [value]);

  // Effect 2: Sync Voice Change -> Upwards
  // When voice changes, re-serialize current HTML to new format and notify parent
  useEffect(() => {
    if (editorRef.current) {
        // htmlToText uses the current 'voice' prop (which triggered this effect)
        const newText = htmlToText(editorRef.current);
        // If re-serialization changed the text (e.g. <#1.0#> -> <break...>)
        if (newText !== value) {
            if (onChange) onChange(newText);
            if (onAutoSave) onAutoSave(newText);
        }
    }
  }, [voice]);

  // Save selection
  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      // Check if range is within our editor
      if (editorRef.current && editorRef.current.contains(range.commonAncestorContainer)) {
        lastRangeRef.current = range.cloneRange();
      }
    }
  };

  // --- Handlers ---

  const handleInput = () => {
    const newText = htmlToText(editorRef.current);
    if (onChange) {
      onChange(newText);
    }
    saveSelection();
  };

  const handleClick = (e) => {
    saveSelection();
    // Check for pill click
    if (e.target.classList.contains('pause-pill')) {
      setEditingPill(e.target);
      setDurationInput(e.target.getAttribute('data-duration'));
      setAnchorEl(e.target);
    }
  };

  const handleKeyUp = () => {
    saveSelection();
  };

  const handleMouseUp = () => {
    saveSelection();
  };

  const handleFocus = (e) => {
      if (onFocus) onFocus(e);
  };

  const handleBlur = (e) => {
      if (onBlur) onBlur(e);
  };

  // --- Imperative Handle ---

  useImperativeHandle(ref, () => ({
    insertPause: () => {
      if (!editorRef.current) return;

      // Restore selection
      if (lastRangeRef.current) {
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(lastRangeRef.current);
      } else {
        // If no selection, append to end
        editorRef.current.focus();
        const range = document.createRange();
        range.selectNodeContents(editorRef.current);
        range.collapse(false);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      }

      const duration = 0.5;
      const pillHtml = `<span class="pause-pill" contenteditable="false" data-duration="${duration.toFixed(1.0)}">停顿 ${duration.toFixed(1)}s</span>`;

      document.execCommand('insertHTML', false, pillHtml);
      handleInput();
    }
  }));

  // --- Popover Logic ---

  const handlePopoverClose = () => {
    setAnchorEl(null);
    setEditingPill(null);
  };

  const handleApplyDuration = () => {
    if (editingPill) {
      let duration = parseFloat(durationInput);
      if (isNaN(duration) || duration < 0) duration = 1.0;
      duration = Math.round(duration * 10) / 10;

      editingPill.setAttribute('data-duration', duration.toFixed(1));

      // Create a copy of the logic to update content, avoiding direct assignment to state variable
      // that linter misinterprets. We are modifying the DOM node directly here.
      const pillNode = editingPill;
      // eslint-disable-next-line react-hooks/immutability
      pillNode.textContent = `|| ${duration.toFixed(1)}s`;

      handleInput();
      handlePopoverClose();
    }
  };

  return (
    <>
      <div
        ref={editorRef}
        className="rich-text-editor"
        contentEditable
        onInput={handleInput}
        onClick={handleClick}
        onKeyUp={handleKeyUp}
        onMouseUp={handleMouseUp}
        onFocus={handleFocus}
        onBlur={handleBlur}
        style={{
          minHeight: '40px',
          padding: '12px',
          outline: 'none',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word'
        }}
        suppressContentEditableWarning={true}
      />

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handlePopoverClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <AccessTimeIcon color="action" />
          <TextField
            size="small"
            label="停顿(秒)"
            type="number"
            value={durationInput}
            onChange={(e) => setDurationInput(e.target.value)}
            inputProps={{ step: 0.1, min: 0.1 }}
            sx={{ width: 100 }}
          />
          <Button
            variant="contained"
            size="small"
            onClick={handleApplyDuration}
            sx={{ bgcolor: '#212121', color: 'white', '&:hover': { bgcolor: 'black' } }}
          >
            应用
          </Button>
        </Box>
      </Popover>
    </>
  );
});

export default RichTextEditor;
