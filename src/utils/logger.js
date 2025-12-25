// src/utils/logger.js

const LOG_SERVER_URL = 'http://localhost:3001/api/logs';

export const ActionTypes = {
  AUTH_LOGIN: 'AUTH_LOGIN',
  AUTH_LOGOUT: 'AUTH_LOGOUT',
  IMPORT_BAIZE: 'IMPORT_BAIZE',
  IMPORT_EXCEL: 'IMPORT_EXCEL',
  IMPORT_PASTE: 'IMPORT_PASTE',
  SYNTHESIS_START: 'SYNTHESIS_START',
  SYNTHESIS_COMPLETE: 'SYNTHESIS_COMPLETE',
  EXPORT_AUDIO: 'EXPORT_AUDIO',
  EXPORT_EXCEL: 'EXPORT_EXCEL',
  UPLOAD_BATCH: 'UPLOAD_BATCH',
  UPLOAD_SINGLE: 'UPLOAD_SINGLE',
  DELETE_GROUP: 'DELETE_GROUP',
  DELETE_SEGMENT: 'DELETE_SEGMENT',
  REGENERATE_SEGMENT: 'REGENERATE_SEGMENT',
  CLEAR_WORKSPACE: 'CLEAR_WORKSPACE',
  ADD_TEST_DATA: 'ADD_TEST_DATA',
  ERROR: 'ERROR'
};

/**
 * Logs a user action to the backend server.
 *
 * @param {string} actionType - One of ActionTypes
 * @param {object|string} details - Additional information about the action
 * @param {string} status - 'success', 'error', 'info', 'warning'
 */
export const logAction = async (actionType, details = {}, status = 'info') => {
  try {
    const userStr = localStorage.getItem('audioEditor_user');
    let username = 'Anonymous';
    if (userStr) {
        try {
            const user = JSON.parse(userStr);
            username = user.account || 'Unknown';
        } catch (e) {
            // ignore
        }
    }

    const payload = {
      action_type: actionType,
      details: details,
      username: username,
      status: status,
      user_agent: navigator.userAgent
    };

    // Fire and forget - don't await this in critical paths unless debugging
    fetch(LOG_SERVER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    }).catch(err => {
      console.warn('Failed to send log:', err);
    });

  } catch (error) {
    console.warn('Error constructing log:', error);
  }
};
