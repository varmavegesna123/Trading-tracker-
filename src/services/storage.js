// Django REST API Storage & Persistence Service for TRADETRACKER Pro
import { authService } from './auth';
import { DJANGO_DATA_URL } from './apiConfig';

const TRADES_KEY = 'tradetracker_trades_v1';
const CAPITAL_LOGS_KEY = 'tradetracker_capital_logs_v1';
const SETTINGS_KEY = 'tradetracker_settings_v1';

const DJANGO_API_URL = DJANGO_DATA_URL;

// Generate user-scoped storage key using email as primary stable identity
const getUserStorageKey = (key) => {
  const user = authService.getCurrentUser();
  const email = user?.email ? user.email.toLowerCase().trim() : null;
  const identity = email || user?.id || user?.username;
  return identity ? `${key}:${identity}` : `${key}:guest`;
};

// Helper to push updates to the authenticated data service.
const syncToBackend = async (dataPayload = {}) => {
  try {
    if (!DJANGO_API_URL) return false;

    const token = authService.getToken();
    if (!token || !authService.getCurrentUser()) return false;

    const currentLocalTrades = storageService.getTrades();
    const currentLocalCapital = storageService.getCapitalLogs();
    
    const payload = {
      trades: dataPayload.trades !== undefined ? dataPayload.trades : currentLocalTrades,
      capitalLogs: dataPayload.capitalLogs !== undefined ? dataPayload.capitalLogs : currentLocalCapital,
      settings: dataPayload.settings !== undefined ? dataPayload.settings : storageService.getSettings(),
      updatedAt: new Date().toISOString()
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(DJANGO_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`Data sync returned status ${response.status}. Local data is retained.`);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Data sync failed; local data was safely retained.', err);
    return false;
  }
};

export const storageService = {
  // Explicit immediate sync function
  syncNow: async (extraData = {}) => {
    return await syncToBackend(extraData);
  },

  // Fetch data from Django backend on page load / login
  fetchFromBackend: async () => {
    try {
      if (!DJANGO_API_URL) return null;

      const token = authService.getToken();
      if (!token || !authService.getCurrentUser()) return null;

      const headers = { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const res = await fetch(DJANGO_API_URL, { headers, signal: controller.signal }).catch(() => null);
      clearTimeout(timeoutId);

      if (!res || !res.ok) return null;
      const data = await res.json();
      
      const tradesKey = getUserStorageKey(TRADES_KEY);
      const capitalLogsKey = getUserStorageKey(CAPITAL_LOGS_KEY);
      const settingsKey = getUserStorageKey(SETTINGS_KEY);

      // Data Protection:
      // If backend has trades, cache them locally.
      // If backend returns empty trades ([]), but local storage already has trades,
      // preserve local trades and sync them UP to the backend!
      if (data && Array.isArray(data.trades)) {
        if (data.trades.length > 0) {
          if (tradesKey) localStorage.setItem(tradesKey, JSON.stringify(data.trades));
        } else {
          const localTrades = storageService.getTrades();
          if (localTrades && localTrades.length > 0) {
            syncToBackend({ trades: localTrades });
            data.trades = localTrades;
          }
        }
      }

      if (data && Array.isArray(data.capitalLogs)) {
        if (data.capitalLogs.length > 0) {
          if (capitalLogsKey) localStorage.setItem(capitalLogsKey, JSON.stringify(data.capitalLogs));
        } else {
          const localCapital = storageService.getCapitalLogs();
          if (localCapital && localCapital.length > 0) {
            syncToBackend({ capitalLogs: localCapital });
            data.capitalLogs = localCapital;
          }
        }
      }

      if (data && data.settings && typeof data.settings === 'object' && Object.keys(data.settings).length > 0) {
        if (settingsKey) localStorage.setItem(settingsKey, JSON.stringify(data.settings));
      }

      return data;
    } catch (err) {
      return null;
    }
  },

  getTrades: () => {
    try {
      const key = getUserStorageKey(TRADES_KEY);
      let data = localStorage.getItem(key);
      if (!data) {
        // Fallback to legacy user id key
        const user = authService.getCurrentUser();
        if (user?.id) data = localStorage.getItem(`${TRADES_KEY}:${user.id}`);
      }
      if (!data) {
        // Fallback to plain un-namespaced key
        data = localStorage.getItem(TRADES_KEY);
      }
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  saveTrades: (trades) => {
    try {
      const key = getUserStorageKey(TRADES_KEY);
      if (key) localStorage.setItem(key, JSON.stringify(trades));
    } catch (e) {
      console.warn('LocalStorage quota exceeded, saving lightweight trades copy without images', e);
      try {
        const key = getUserStorageKey(TRADES_KEY);
        const strippedTrades = trades.map(t => {
          if (!t) return t;
          const { chartUrl, ...rest } = t;
          return rest;
        });
        if (key) localStorage.setItem(key, JSON.stringify(strippedTrades));
      } catch (err) {
        console.error('Failed to save trades to storage', err);
      }
    }
    syncToBackend({ trades });
  },

  getCapitalLogs: () => {
    try {
      const key = getUserStorageKey(CAPITAL_LOGS_KEY);
      let data = localStorage.getItem(key);
      if (!data) {
        const user = authService.getCurrentUser();
        if (user?.id) data = localStorage.getItem(`${CAPITAL_LOGS_KEY}:${user.id}`);
      }
      if (!data) {
        data = localStorage.getItem(CAPITAL_LOGS_KEY);
      }
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  saveCapitalLogs: (capitalLogs) => {
    try {
      const key = getUserStorageKey(CAPITAL_LOGS_KEY);
      if (key) localStorage.setItem(key, JSON.stringify(capitalLogs));
      syncToBackend({ capitalLogs });
    } catch (e) {
      console.error('Failed to save capital logs to storage', e);
    }
  },

  getSettings: () => {
    try {
      const key = getUserStorageKey(SETTINGS_KEY);
      let data = localStorage.getItem(key);
      if (!data) {
        data = localStorage.getItem(SETTINGS_KEY);
      }
      return data ? JSON.parse(data) : { currency: 'INR' };
    } catch (e) {
      return { currency: 'INR' };
    }
  },

  saveSettings: (settings) => {
    try {
      const key = getUserStorageKey(SETTINGS_KEY);
      if (key) localStorage.setItem(key, JSON.stringify(settings));
      syncToBackend({ settings });
    } catch (e) {
      console.error('Failed to save settings', e);
    }
  },

  exportTradesCSV: () => {
    const trades = storageService.getTrades();
    if (trades.length === 0) {
      alert('No trades available to export.');
      return;
    }

    const headers = [
      'ID', 'Date', 'Symbol', 'Type', 'Direction', 'Market', 'Exchange',
      'Entry Price', 'Exit Price', 'Quantity', 'Status', 'Strategy', 'Notes'
    ];

    const rows = trades.map(t => [
      t.id,
      t.entryDate || '',
      t.symbol || '',
      t.tradeType || 'Intraday',
      t.direction || 'LONG',
      t.market || 'Equity',
      t.exchange || 'NSE',
      t.entryPrice !== undefined ? t.entryPrice : '',
      t.exitPrice !== undefined ? t.exitPrice : '',
      t.quantity !== undefined ? t.quantity : '',
      t.status || 'CLOSED',
      `"${(t.strategy || '').replace(/"/g, '""')}"`,
      `"${(t.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(e => e.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `tradetracker_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  exportDataJSON: () => {
    const trades = storageService.getTrades();
    const capitalLogs = storageService.getCapitalLogs();
    const settings = storageService.getSettings();

    const data = {
      trades,
      capitalLogs,
      settings,
      exportedAt: new Date().toISOString()
    };

    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
    const link = document.createElement('a');
    link.setAttribute('href', jsonString);
    link.setAttribute('download', `tradetracker_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  loadSampleData: () => {
    const sampleTrades = [];
    const sampleCapital = [{ id: 'cap-1', type: 'DEPOSIT', amount: 50000, date: new Date().toISOString() }];
    storageService.saveTrades(sampleTrades);
    storageService.saveCapitalLogs(sampleCapital);
    return { trades: sampleTrades, capitalLogs: sampleCapital };
  },

  clearAll: () => {
    const tradesKey = getUserStorageKey(TRADES_KEY);
    const capitalLogsKey = getUserStorageKey(CAPITAL_LOGS_KEY);
    const settingsKey = getUserStorageKey(SETTINGS_KEY);
    if (tradesKey) localStorage.removeItem(tradesKey);
    if (capitalLogsKey) localStorage.removeItem(capitalLogsKey);
    if (settingsKey) localStorage.removeItem(settingsKey);
    syncToBackend({ trades: [], capitalLogs: [] });
  }
};
