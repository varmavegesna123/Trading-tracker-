// Django REST API Storage & Persistence Service for TRADETRACKER Pro
import { authService } from './auth';
import { DJANGO_DATA_URL } from './apiConfig';

const TRADES_KEY = 'tradetracker_trades_v1';
const CAPITAL_LOGS_KEY = 'tradetracker_capital_logs_v1';
const SETTINGS_KEY = 'tradetracker_settings_v1';

const DJANGO_API_URL = DJANGO_DATA_URL;


const getUserStorageKey = (key) => {
  const user = authService.getCurrentUser();
  const identity = user?.id || user?.email;
  return identity ? `${key}:${identity}` : null;
};

// Helper to push updates to the authenticated data service.
const syncToBackend = async (dataPayload) => {
  try {
    if (!DJANGO_API_URL) return;

    const token = authService.getToken();
    if (!token || !authService.getCurrentUser()) return;

    const currentLocalTrades = storageService.getTrades();
    const currentLocalCapital = storageService.getCapitalLogs();
    
    const payload = {
      trades: dataPayload.trades || currentLocalTrades,
      capitalLogs: dataPayload.capitalLogs || currentLocalCapital,
      settings: storageService.getSettings(),
      updatedAt: new Date().toISOString()
    };

    const response = await fetch(DJANGO_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      throw new Error(`Data sync failed with status ${response.status}.`);
    }
  } catch (err) {
    console.error('Data sync failed; local data was retained.', err);
  }
};

export const storageService = {
  // Fetch data from Django backend on page reload
  fetchFromBackend: async () => {
    try {
      if (!DJANGO_API_URL) return null;

      const token = authService.getToken();
      if (!token || !authService.getCurrentUser()) return null;

      const headers = { Authorization: `Bearer ${token}` };
      const res = await fetch(DJANGO_API_URL, { headers }).catch(() => null);
      if (!res || !res.ok) return null;
      const data = await res.json();
      const tradesKey = getUserStorageKey(TRADES_KEY);
      const capitalLogsKey = getUserStorageKey(CAPITAL_LOGS_KEY);
      if (data && Array.isArray(data.trades)) {
        if (tradesKey) localStorage.setItem(tradesKey, JSON.stringify(data.trades));
      }
      if (data && Array.isArray(data.capitalLogs)) {
        if (capitalLogsKey) localStorage.setItem(capitalLogsKey, JSON.stringify(data.capitalLogs));
      }
      return data;
    } catch (err) {
      return null;
    }
  },

  getTrades: () => {
    try {
      const key = getUserStorageKey(TRADES_KEY);
      if (!key) return [];
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  saveTrades: (trades) => {
    try {
      const key = getUserStorageKey(TRADES_KEY);
      if (!key) return;
      localStorage.setItem(key, JSON.stringify(trades));
    } catch (e) {
      console.warn('LocalStorage quota exceeded, saving lightweight trades copy without images', e);
      try {
        const strippedTrades = trades.map(t => {
          if (!t) return t;
          const { chartUrl, ...rest } = t;
          return rest;
        });
        localStorage.setItem(key, JSON.stringify(strippedTrades));
      } catch (err) {
        console.error('Failed to save trades to storage', err);
      }
    }
    syncToBackend({ trades });
  },

  getCapitalLogs: () => {
    try {
      const key = getUserStorageKey(CAPITAL_LOGS_KEY);
      if (!key) return [];
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  saveCapitalLogs: (capitalLogs) => {
    try {
      const key = getUserStorageKey(CAPITAL_LOGS_KEY);
      if (!key) return;
      localStorage.setItem(key, JSON.stringify(capitalLogs));
      syncToBackend({ capitalLogs });
    } catch (e) {
      console.error('Failed to save capital logs to storage', e);
    }
  },

  getSettings: () => {
    try {
      const key = getUserStorageKey(SETTINGS_KEY);
      if (!key) return { currency: 'INR' };
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : { currency: 'INR' };
    } catch (e) {
      return { currency: 'INR' };
    }
  },

  saveSettings: (settings) => {
    try {
      const key = getUserStorageKey(SETTINGS_KEY);
      if (!key) return;
      localStorage.setItem(key, JSON.stringify(settings));
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
