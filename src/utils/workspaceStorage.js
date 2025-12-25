const DB_NAME = 'TtsEditorDB';
const DB_VERSION = 1;
const STORE_NAME = 'workspace';
const KEY = 'current';

class WorkspaceStorage {
  constructor() {
    this.db = null;
    this.initPromise = null;
  }

  async initDB() {
    if (this.db) return this.db;
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve(this.db);
      };

      request.onerror = (event) => {
        console.error('IndexedDB error:', event.target.error);
        reject(event.target.error);
      };
    });

    return this.initPromise;
  }

  async saveWorkspace(data) {
    try {
      const db = await this.initDB();
      const cleanData = this._sanitizeData(data);

      // Add timestamp and count meta-info
      const payload = {
        ...cleanData,
        timestamp: Date.now(),
        count: cleanData.audioGroups ? cleanData.audioGroups.length : 0
      };

      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put(payload, KEY);

        request.onsuccess = () => resolve();
        request.onerror = (e) => reject(e.target.error);
      });
    } catch (error) {
      console.error('Failed to save workspace:', error);
      throw error;
    }
  }

  async loadWorkspace() {
    try {
      const db = await this.initDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(KEY);

        request.onsuccess = () => {
            const data = request.result;
            if (data) {
                resolve(this._rehydrateData(data));
            } else {
                resolve(null);
            }
        };
        request.onerror = (e) => reject(e.target.error);
      });
    } catch (error) {
      console.error('Failed to load workspace:', error);
      return null;
    }
  }

  async clearWorkspace() {
    try {
      const db = await this.initDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(KEY);

        request.onsuccess = () => resolve();
        request.onerror = (e) => reject(e.target.error);
      });
    } catch (error) {
      console.error('Failed to clear workspace:', error);
      throw error;
    }
  }

  // Private helpers
  _sanitizeData(data) {
    // Deep clone to avoid mutating original state, but careful with Blobs
    // We only need to process audioGroups specifically
    const { audioGroups, ...rest } = data;

    if (!audioGroups) return data;

    const cleanAudioGroups = audioGroups.map(group => ({
      ...group,
      segments: group.segments.map(seg => {
        // eslint-disable-next-line no-unused-vars
        const { url, ...segRest } = seg; // Strip URL
        return segRest;
      })
    }));

    return {
      audioGroups: cleanAudioGroups,
      ...rest
    };
  }

  _rehydrateData(data) {
    if (!data || !data.audioGroups) return data;

    const rehydratedAudioGroups = data.audioGroups.map(group => ({
      ...group,
      segments: group.segments.map(seg => ({
        ...seg,
        // Regenerate URL from Blob if blob exists
        url: seg.blob ? URL.createObjectURL(seg.blob) : null
      }))
    }));

    return {
      ...data,
      audioGroups: rehydratedAudioGroups
    };
  }
}

export const workspaceStorage = new WorkspaceStorage();
