const BASE_URL = 'http://ai.api.bountech.com/aiprod';

// Login
export async function login(username, password) {
  const formData = new FormData();
  formData.append('account', username);
  formData.append('password', password);

  // User provided specific endpoint for login in snippet
  // ${BASE_URL}/AiSpeech/admin/login
  const url = `${BASE_URL}/AiSpeech/admin/login`;

  // NOTE: For login, we might need proxy too if CORS is an issue,
  // but user's snippet didn't use proxy for login, so we try direct first.
  // Actually, snippet in edit.html used direct fetch.
  // But subsequent snippets used /api/proxy/get.
  // We'll try direct first as per snippet.

  try {
      const response = await fetch(url, {
          method: 'POST',
          body: formData
      });

      if (!response.ok) {
          const text = await response.text();
          throw new Error(`Login failed: ${response.status} ${text}`);
      }
      return await response.json();
  } catch (e) {
      console.error("Login error", e);
      throw e;
  }
}

// Fetch Scripts
export async function fetchScripts(token) {
    // const status = 'EDIT';
    // const http_url = `${BASE_URL}/AiSpeech/scriptEditor/findAllScriptInPermission?status=${status}`;
    // Using proxy as requested
    const targetUrl = `${BASE_URL}/AiSpeech/scriptEditor/findAllScriptInPermission?status=EDIT`;
    const proxyUrl = `/api/proxy/get?url=${encodeURIComponent(targetUrl)}`;

    console.log(`Fetching scripts from: ${proxyUrl}`);

    const response = await fetch(proxyUrl, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'token': token
        },
    });

    if (!response.ok) {
        throw new Error(`Fetch scripts failed: ${response.status}`);
    }
    return await response.json();
}

// Fetch Corpus for Script
export async function fetchScriptCorpus(token, scriptId) {
    const targetUrl = `${BASE_URL}/AiSpeech/scriptCorpus/audioList`;
    const proxyUrl = `/api/proxy/post?url=${encodeURIComponent(targetUrl)}`;

    console.log(`Fetching corpus from: ${proxyUrl} for scriptId: ${scriptId}`);

    const response = await fetch(proxyUrl, {
        method: 'POST',
        headers: {
            'accept': '*/*',
            'content-type': 'application/json',
            'token': token
        },
        body: JSON.stringify({ scriptId: scriptId })
    });

    if (!response.ok) {
        throw new Error(`Fetch corpus failed: ${response.status}`);
    }
    return await response.json();
}

// Upload Audio
export async function uploadAudio(token, contentId, wavBlob, filename) {
    const targetUrl = `${BASE_URL}/AiSpeech/scriptCorpus/importSingle?contentId=${contentId}`;
    const proxyUrl = `/api/proxy/post?url=${encodeURIComponent(targetUrl)}`;

    console.log(`Uploading audio to: ${proxyUrl} for contentId: ${contentId}`);

    const formData = new FormData();
    formData.append('file', wavBlob, filename);

    const response = await fetch(proxyUrl, {
        method: 'POST',
        headers: {
            'token': token
        },
        body: formData
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        // Pass specific error message if available
        throw new Error(errorData.msg || errorData.message || `Upload audio failed: ${response.status}`);
    }
    return await response.json();
}

// Update Text (Placeholder)
export async function updateScriptText(token, contentId, newText) {
    console.warn("updateScriptText is a placeholder. Implementing basic log.");
    console.log(`[Placeholder] Updating text for contentId ${contentId} to: "${newText}"`);
    // Return a fake success response
    return Promise.resolve({ success: true, message: "Placeholder: Text updated locally logged" });
}

// Helper: AudioBuffer to WAV (from provided snippet or existing code)
// We already have bufferToWave in TtsEditor.jsx, we can reuse or duplicate.
// Since this is a service file, maybe it shouldn't depend on DOM specific things unless necessary.
// But TtsEditor.jsx has the logic. We'll pass the blob from the component.
