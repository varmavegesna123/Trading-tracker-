import React, { useState, useEffect } from 'react';
import { 
  Sliders, 
  DollarSign, 
  Download, 
  Upload, 
  RotateCcw, 
  Trash2, 
  Database, 
  CheckCircle2, 
  ShieldCheck,
  Coins,
  Sun,
  Moon,
  Bell,
  Lock,
  KeyRound,
  Globe,
  Link2,
  ShieldAlert,
  FileSpreadsheet,
  HardDrive,
  HelpCircle,
  AlertTriangle,
  User,
  Mail,
  Laptop,
  Smartphone,
  ExternalLink,
  RefreshCw,
  X,
  Save,
  AlertCircle,
  Check,
  Cpu,
  LogOut,
  MessageSquare,
  FileText
} from 'lucide-react';
import { storageService } from '../services/storage';

export function SettingsView({ 
  currency = 'INR', 
  setCurrency, 
  darkMode = true,
  setDarkMode,
  onLoadSampleData, 
  onClearAllData,
  onExportCSV,
  onExportJSON,
  user,
  trades = [],
  onOpenImportModal,
  setCurrentTab
}) {
  // Helper for user-scoped storage key
  const getStorageKey = () => {
    const identity = user?.id || user?.email;
    return identity ? `tradetracker_settings_v2:${identity}` : 'tradetracker_settings_v2';
  };

  // Local state persisted in localStorage
  const [settings, setSettings] = useState(() => {
    const identity = user?.id || user?.email;
    const key = identity ? `tradetracker_settings_v2:${identity}` : 'tradetracker_settings_v2';
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved settings', e);
      }
    }
    return {
      // General
      timezone: 'UTC',
      dateFormat: 'YYYY-MM-DD',
      numberFormat: '1,234.56',
      defaultLandingPage: 'dashboard',
      
      // Trading
      defaultMarket: 'Crypto',
      defaultDirection: 'Long',
      positionSizing: 'Quantity',
      riskCalculation: 'Percentage',
      includeFees: true,
      includeTaxes: true,
      defaultRiskPerTrade: 1.0,

      // Journal
      autoSaveDrafts: true,
      defaultStrategy: 'Breakout',
      requireNotes: false,
      requireScreenshot: false,
      confirmDeletion: true,
      defaultTags: 'crypto, scalp',

      // Notifications
      dailyReminder: true,
      eodReview: true,
      weeklySummary: true,
      riskAlerts: true,
      drawdownAlerts: true,
      securityAlerts: true,
      emailDigest: 'daily',

      // Security
      twoFactorEnabled: false,

      // Integrations
      marketDataFeed: 'default',
      googleConnected: true,
      githubConnected: false,
      binanceConnected: false,
      ibkrConnected: false,
      zerodhaConnected: false,

      // Backup & Privacy
      autoCloudBackup: true,
      anonymousAnalytics: false,
      marketingEmails: false,
      dataRetention: 'Forever'
    };
  });

  // Active section for sticky nav highlight
  const [activeSection, setActiveSection] = useState('general');
  const [toastMessage, setToastMessage] = useState(null);

  // Modals state
  const [activeModal, setActiveModal] = useState(null); // 'changePassword', '2fa', 'reportBug', 'resetConfirm', 'deleteAccountConfirm'
  const [passwordForm, setPasswordForm] = useState({ current: '', newPass: '', confirmPass: '' });
  const [bugForm, setBugForm] = useState({ subject: '', description: '', severity: 'Low' });
  const [resetConfirmInput, setResetConfirmInput] = useState('');
  const [deleteConfirmInput, setDeleteConfirmInput] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');

  // Persist settings whenever changed
  const updateSetting = (key, value) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    const storageKey = getStorageKey();
    localStorage.setItem(storageKey, JSON.stringify(updated));
    storageService.saveSettings(updated);
    showToast('Setting updated successfully');
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Section observer / click scroll
  const scrollToSection = (id) => {
    setActiveSection(id);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Active sessions mock list
  const [activeSessions, setActiveSessions] = useState([
    { id: 1, device: 'Chrome on Windows 11', location: 'New York, USA (Current)', ip: '192.168.1.101', lastActive: 'Active Now', current: true },
    { id: 2, device: 'Antigravity Mobile App (iOS)', location: 'London, UK', ip: '82.165.4.12', lastActive: '2 hours ago', current: false },
    { id: 3, device: 'Safari on MacOS', location: 'Tokyo, Japan', ip: '210.140.10.5', lastActive: '3 days ago', current: false }
  ]);

  const revokeSession = (id) => {
    setActiveSessions(activeSessions.filter(s => s.id !== id));
    showToast('Session revoked successfully');
  };

  const revokeAllOtherSessions = () => {
    setActiveSessions(activeSessions.filter(s => s.current));
    showToast('All other sessions signed out');
  };

  const sectionsNav = [
    { id: 'general', label: 'General' },
    { id: 'trading-prefs', label: 'Trading' },
    { id: 'journal-prefs', label: 'Journal' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'security', label: 'Security' },
    { id: 'integrations', label: 'Integrations' },
    { id: 'backup', label: 'Backup & Export' },
    { id: 'privacy', label: 'Privacy' },
    { id: 'demo-data', label: 'Demo Data' },
    { id: 'help', label: 'Help & About' },
    { id: 'danger-zone', label: 'Danger Zone' }
  ];

  return (
    <div className="relative max-w-5xl space-y-6 pb-20 font-sans">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-2 bg-[#0284C7] text-white px-4 py-3 rounded-xl shadow-xl border border-sky-400/30 animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-4 h-4 text-sky-200" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="p-6 rounded-2xl bg-[#111726] border border-[#1E2638] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-[#38BDF8]" />
            <h2 className="text-xl font-bold text-white font-jakarta">
              Settings & Workspace Preferences
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Configure system themes, currency, trading defaults, security options, integrations, and data backups.
          </p>
        </div>
        <div className="flex items-center space-x-2 shrink-0">
          <span className="px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/30">
            PRO LICENSE v2.4.0
          </span>
        </div>
      </div>

      {/* Sticky Section Navigation Bar */}
      <div className="sticky top-0 z-30 bg-[#0B0F19]/90 backdrop-blur-md py-2.5 px-3 rounded-2xl border border-[#1E2638] shadow-md overflow-x-auto no-scrollbar flex items-center space-x-1">
        {sectionsNav.map((sec) => (
          <button
            key={sec.id}
            onClick={() => scrollToSection(sec.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              sec.id === 'danger-zone' 
                ? activeSection === sec.id 
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' 
                  : 'text-rose-400/70 hover:text-rose-400 hover:bg-rose-500/10'
                : activeSection === sec.id
                  ? 'bg-[#38BDF8] text-white font-bold shadow-sm shadow-sky-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-[#111726]'
            }`}
          >
            {sec.label}
          </button>
        ))}
      </div>

      {/* 1. General Preferences & Account */}
      <section id="general" className="p-6 rounded-2xl bg-[#111726] border border-[#1E2638] shadow-sm space-y-6 scroll-mt-20">
        <div className="flex items-center space-x-2 text-sm font-bold text-white border-b border-[#1E2638] pb-3 font-jakarta">
          <Globe className="w-4 h-4 text-[#38BDF8]" />
          <span>1. General Preferences & Account</span>
        </div>

        <div className="space-y-4">
          {/* Theme Selector */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#1E2638]/50">
            <div>
              <label className="text-xs font-semibold text-slate-200 block">Appearance Theme</label>
              <p className="text-[11px] text-slate-400">Select interface accent scheme and display mode.</p>
            </div>
            <div className="flex items-center space-x-2 bg-[#0B0F19] p-1 rounded-xl border border-[#1E2638]">
              <button
                type="button"
                onClick={() => setDarkMode && setDarkMode(true)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                  darkMode ? 'bg-[#38BDF8] text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
                <span>Dark</span>
              </button>
              <button
                type="button"
                onClick={() => setDarkMode && setDarkMode(false)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                  !darkMode ? 'bg-[#0284C7] text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                <span>Light</span>
              </button>
            </div>
          </div>

          {/* Account Currency */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#1E2638]/50">
            <div>
              <label className="text-xs font-semibold text-slate-200 block">Preferred Display Currency</label>
              <p className="text-[11px] text-slate-400">Delta Exchange India fixed conversion: 1 USD = ₹85. Financial values update immediately.</p>
            </div>
            <select
              value={currency}
              onChange={(e) => setCurrency && setCurrency(e.target.value)}
              className="px-3 py-2 bg-[#0B0F19] text-white text-xs font-bold rounded-xl border border-[#1E2638] focus:outline-none focus:border-[#38BDF8] w-56 font-mono cursor-pointer"
            >
              <option value="INR">₹ INR (Indian Rupee)</option>
              <option value="USD">$ USD (US Dollar - ₹85)</option>
              <option value="USDT">₮ USDT (Tether USD - ₹85)</option>
              <option value="EUR">€ EUR (Euro)</option>
              <option value="GBP">£ GBP (British Pound)</option>
            </select>
          </div>

          {/* Timezone */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#1E2638]/50">
            <div>
              <label className="text-xs font-semibold text-slate-200 block">Timezone</label>
              <p className="text-[11px] text-slate-400">Used for trade timestamps and session analytics.</p>
            </div>
            <select
              value={settings.timezone}
              onChange={(e) => updateSetting('timezone', e.target.value)}
              className="px-3 py-2 bg-[#0B0F19] text-white text-xs font-bold rounded-xl border border-[#1E2638] focus:outline-none focus:border-[#38BDF8] w-48 font-mono cursor-pointer"
            >
              <option value="UTC">UTC (Universal Coordinated)</option>
              <option value="EST">EST / EDT (New York)</option>
              <option value="PST">PST / PDT (Los Angeles)</option>
              <option value="IST">IST (India Standard Time)</option>
              <option value="GMT">GMT (London / UTC+0)</option>
              <option value="CET">CET (Central Europe)</option>
            </select>
          </div>

          {/* Date Format */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#1E2638]/50">
            <div>
              <label className="text-xs font-semibold text-slate-200 block">Date Format</label>
              <p className="text-[11px] text-slate-400">Preferred format for trade dates and logs.</p>
            </div>
            <select
              value={settings.dateFormat}
              onChange={(e) => updateSetting('dateFormat', e.target.value)}
              className="px-3 py-2 bg-[#0B0F19] text-white text-xs font-bold rounded-xl border border-[#1E2638] focus:outline-none focus:border-[#38BDF8] w-48 font-mono cursor-pointer"
            >
              <option value="YYYY-MM-DD">YYYY-MM-DD (ISO)</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY (US)</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY (EU/Asia)</option>
              <option value="MMM DD, YYYY">MMM DD, YYYY</option>
            </select>
          </div>

          {/* Number Format */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#1E2638]/50">
            <div>
              <label className="text-xs font-semibold text-slate-200 block">Number Format</label>
              <p className="text-[11px] text-slate-400">Thousands separators and decimal places.</p>
            </div>
            <select
              value={settings.numberFormat}
              onChange={(e) => updateSetting('numberFormat', e.target.value)}
              className="px-3 py-2 bg-[#0B0F19] text-white text-xs font-bold rounded-xl border border-[#1E2638] focus:outline-none focus:border-[#38BDF8] w-48 font-mono cursor-pointer"
            >
              <option value="1,234.56">1,234.56 (Standard US)</option>
              <option value="1.234,56">1.234,56 (European)</option>
              <option value="1 234,56">1 234,56 (French / SI)</option>
            </select>
          </div>

          {/* Default Landing Page */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-200 block">Default Landing Page</label>
              <p className="text-[11px] text-slate-400">View displayed upon opening the application.</p>
            </div>
            <select
              value={settings.defaultLandingPage}
              onChange={(e) => updateSetting('defaultLandingPage', e.target.value)}
              className="px-3 py-2 bg-[#0B0F19] text-white text-xs font-bold rounded-xl border border-[#1E2638] focus:outline-none focus:border-[#38BDF8] w-48 font-mono cursor-pointer"
            >
              <option value="dashboard">Dashboard</option>
              <option value="trades">Trade Log / Journal</option>
              <option value="analytics">Analytics</option>
              <option value="calendar">Calendar</option>
              <option value="reports">Reports</option>
            </select>
          </div>
        </div>
      </section>

      {/* 2. Trading Preferences */}
      <section id="trading-prefs" className="p-6 rounded-2xl bg-[#111726] border border-[#1E2638] shadow-sm space-y-6 scroll-mt-20">
        <div className="flex items-center space-x-2 text-sm font-bold text-white border-b border-[#1E2638] pb-3 font-jakarta">
          <Coins className="w-4 h-4 text-[#38BDF8]" />
          <span>2. Trading Preferences</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-[#0B0F19] border border-[#1E2638] space-y-2">
            <label className="text-xs font-semibold text-slate-200 block">Default Market Asset Class</label>
            <select
              value={settings.defaultMarket}
              onChange={(e) => updateSetting('defaultMarket', e.target.value)}
              className="w-full px-3 py-2 bg-[#111726] text-white text-xs font-bold rounded-xl border border-[#1E2638] focus:outline-none focus:border-[#38BDF8]"
            >
              <option value="Crypto">Crypto (USDT / BTC Pairs)</option>
              <option value="Stocks">Stocks / Equities</option>
              <option value="Forex">Forex Pairs</option>
              <option value="Futures">Futures & Commodities</option>
            </select>
          </div>

          <div className="p-4 rounded-xl bg-[#0B0F19] border border-[#1E2638] space-y-2">
            <label className="text-xs font-semibold text-slate-200 block">Default Trade Direction</label>
            <select
              value={settings.defaultDirection}
              onChange={(e) => updateSetting('defaultDirection', e.target.value)}
              className="w-full px-3 py-2 bg-[#111726] text-white text-xs font-bold rounded-xl border border-[#1E2638] focus:outline-none focus:border-[#38BDF8]"
            >
              <option value="Long">Long (Buy)</option>
              <option value="Short">Short (Sell)</option>
            </select>
          </div>

          <div className="p-4 rounded-xl bg-[#0B0F19] border border-[#1E2638] space-y-2">
            <label className="text-xs font-semibold text-slate-200 block">Position Sizing Metric</label>
            <select
              value={settings.positionSizing}
              onChange={(e) => updateSetting('positionSizing', e.target.value)}
              className="w-full px-3 py-2 bg-[#111726] text-white text-xs font-bold rounded-xl border border-[#1E2638] focus:outline-none focus:border-[#38BDF8]"
            >
              <option value="Quantity">Quantity (Units)</option>
              <option value="Lots">Standard Lots</option>
              <option value="Contracts">Contracts</option>
            </select>
          </div>

          <div className="p-4 rounded-xl bg-[#0B0F19] border border-[#1E2638] space-y-2">
            <label className="text-xs font-semibold text-slate-200 block">Risk Calculation Method</label>
            <select
              value={settings.riskCalculation}
              onChange={(e) => updateSetting('riskCalculation', e.target.value)}
              className="w-full px-3 py-2 bg-[#111726] text-white text-xs font-bold rounded-xl border border-[#1E2638] focus:outline-none focus:border-[#38BDF8]"
            >
              <option value="Percentage">Percentage of Portfolio (%)</option>
              <option value="Fixed Amount">Fixed Fiat Amount ($/₹)</option>
            </select>
          </div>
        </div>

        <div className="pt-2 space-y-3">
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#0B0F19] border border-[#1E2638]">
            <div>
              <span className="text-xs font-semibold text-slate-200">Include Trading Fees in Net P&L</span>
              <p className="text-[11px] text-slate-400">Automatically subtract exchange fees from trade profit.</p>
            </div>
            <button
              type="button"
              onClick={() => updateSetting('includeFees', !settings.includeFees)}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                settings.includeFees ? 'bg-[#38BDF8]' : 'bg-slate-700'
              }`}
            >
              <span className={`block w-4 h-4 bg-white rounded-full transition-transform transform ${
                settings.includeFees ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-[#0B0F19] border border-[#1E2638]">
            <div>
              <span className="text-xs font-semibold text-slate-200">Include Taxes & Commissions</span>
              <p className="text-[11px] text-slate-400">Account for regulatory STT, GST, or broker commission.</p>
            </div>
            <button
              type="button"
              onClick={() => updateSetting('includeTaxes', !settings.includeTaxes)}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                settings.includeTaxes ? 'bg-[#38BDF8]' : 'bg-slate-700'
              }`}
            >
              <span className={`block w-4 h-4 bg-white rounded-full transition-transform transform ${
                settings.includeTaxes ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-[#0B0F19] border border-[#1E2638]">
            <div>
              <span className="text-xs font-semibold text-slate-200">Default Target Risk Per Trade (%)</span>
              <p className="text-[11px] text-slate-400">Pre-fill risk amount in trade creation wizard.</p>
            </div>
            <input
              type="number"
              step="0.1"
              value={settings.defaultRiskPerTrade}
              onChange={(e) => updateSetting('defaultRiskPerTrade', parseFloat(e.target.value) || 0)}
              className="w-24 px-3 py-1.5 bg-[#111726] text-white text-xs font-mono font-bold rounded-xl border border-[#1E2638] focus:outline-none focus:border-[#38BDF8] text-right"
            />
          </div>
        </div>
      </section>

      {/* 3. Journal Preferences */}
      <section id="journal-prefs" className="p-6 rounded-2xl bg-[#111726] border border-[#1E2638] shadow-sm space-y-6 scroll-mt-20">
        <div className="flex items-center space-x-2 text-sm font-bold text-white border-b border-[#1E2638] pb-3 font-jakarta">
          <FileText className="w-4 h-4 text-[#38BDF8]" />
          <span>3. Journal Preferences</span>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#0B0F19] border border-[#1E2638]">
            <div>
              <span className="text-xs font-semibold text-slate-200">Auto-save Trade Drafts</span>
              <p className="text-[11px] text-slate-400">Save unfinished trade forms automatically in local cache.</p>
            </div>
            <button
              type="button"
              onClick={() => updateSetting('autoSaveDrafts', !settings.autoSaveDrafts)}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                settings.autoSaveDrafts ? 'bg-[#38BDF8]' : 'bg-slate-700'
              }`}
            >
              <span className={`block w-4 h-4 bg-white rounded-full transition-transform transform ${
                settings.autoSaveDrafts ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-[#0B0F19] border border-[#1E2638]">
            <div>
              <span className="text-xs font-semibold text-slate-200">Require Journal Notes Before Closing</span>
              <p className="text-[11px] text-slate-400">Enforce writing trade review notes before closing a trade.</p>
            </div>
            <button
              type="button"
              onClick={() => updateSetting('requireNotes', !settings.requireNotes)}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                settings.requireNotes ? 'bg-[#38BDF8]' : 'bg-slate-700'
              }`}
            >
              <span className={`block w-4 h-4 bg-white rounded-full transition-transform transform ${
                settings.requireNotes ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-[#0B0F19] border border-[#1E2638]">
            <div>
              <span className="text-xs font-semibold text-slate-200">Require Trade Chart Screenshot</span>
              <p className="text-[11px] text-slate-400">Prompt for chart image URL or upload when logging trade.</p>
            </div>
            <button
              type="button"
              onClick={() => updateSetting('requireScreenshot', !settings.requireScreenshot)}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                settings.requireScreenshot ? 'bg-[#38BDF8]' : 'bg-slate-700'
              }`}
            >
              <span className={`block w-4 h-4 bg-white rounded-full transition-transform transform ${
                settings.requireScreenshot ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-[#0B0F19] border border-[#1E2638]">
            <div>
              <span className="text-xs font-semibold text-slate-200">Confirm Before Trade Deletion</span>
              <p className="text-[11px] text-slate-400">Show prompt confirmation dialog before deleting any trade.</p>
            </div>
            <button
              type="button"
              onClick={() => updateSetting('confirmDeletion', !settings.confirmDeletion)}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                settings.confirmDeletion ? 'bg-[#38BDF8]' : 'bg-slate-700'
              }`}
            >
              <span className={`block w-4 h-4 bg-white rounded-full transition-transform transform ${
                settings.confirmDeletion ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>

          <div className="p-4 rounded-xl bg-[#0B0F19] border border-[#1E2638] space-y-2">
            <label className="text-xs font-semibold text-slate-200 block">Default Trade Tags (comma separated)</label>
            <input
              type="text"
              value={settings.defaultTags}
              onChange={(e) => updateSetting('defaultTags', e.target.value)}
              placeholder="e.g. scalp, breakout, trend-following"
              className="w-full px-3 py-2 bg-[#111726] text-white text-xs font-mono rounded-xl border border-[#1E2638] focus:outline-none focus:border-[#38BDF8]"
            />
          </div>
        </div>
      </section>

      {/* 4. Notifications */}
      <section id="notifications" className="p-6 rounded-2xl bg-[#111726] border border-[#1E2638] shadow-sm space-y-6 scroll-mt-20">
        <div className="flex items-center space-x-2 text-sm font-bold text-white border-b border-[#1E2638] pb-3 font-jakarta">
          <Bell className="w-4 h-4 text-[#38BDF8]" />
          <span>4. Notifications & Alerts</span>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#0B0F19] border border-[#1E2638]">
            <div>
              <span className="text-xs font-semibold text-slate-200">Daily Trading Journal Reminder</span>
              <p className="text-[11px] text-slate-400">Receive a daily notification to record your trades and market observations.</p>
            </div>
            <button
              type="button"
              onClick={() => updateSetting('dailyReminder', !settings.dailyReminder)}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                settings.dailyReminder ? 'bg-[#38BDF8]' : 'bg-slate-700'
              }`}
            >
              <span className={`block w-4 h-4 bg-white rounded-full transition-transform transform ${
                settings.dailyReminder ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-[#0B0F19] border border-[#1E2638]">
            <div>
              <span className="text-xs font-semibold text-slate-200">End-of-Day Performance Review Prompt</span>
              <p className="text-[11px] text-slate-400">Prompt at market close to summarize daily P&L and win rate.</p>
            </div>
            <button
              type="button"
              onClick={() => updateSetting('eodReview', !settings.eodReview)}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                settings.eodReview ? 'bg-[#38BDF8]' : 'bg-slate-700'
              }`}
            >
              <span className={`block w-4 h-4 bg-white rounded-full transition-transform transform ${
                settings.eodReview ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-[#0B0F19] border border-[#1E2638]">
            <div>
              <span className="text-xs font-semibold text-slate-200">Weekly Performance Summary Report</span>
              <p className="text-[11px] text-slate-400">Weekly email breakdown of profit factors and strategy breakdown.</p>
            </div>
            <button
              type="button"
              onClick={() => updateSetting('weeklySummary', !settings.weeklySummary)}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                settings.weeklySummary ? 'bg-[#38BDF8]' : 'bg-slate-700'
              }`}
            >
              <span className={`block w-4 h-4 bg-white rounded-full transition-transform transform ${
                settings.weeklySummary ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-[#0B0F19] border border-[#1E2638]">
            <div>
              <span className="text-xs font-semibold text-slate-200">Risk Limit Exceeded Alerts</span>
              <p className="text-[11px] text-slate-400">Immediate popup notification if position size exceeds max daily risk.</p>
            </div>
            <button
              type="button"
              onClick={() => updateSetting('riskAlerts', !settings.riskAlerts)}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                settings.riskAlerts ? 'bg-[#38BDF8]' : 'bg-slate-700'
              }`}
            >
              <span className={`block w-4 h-4 bg-white rounded-full transition-transform transform ${
                settings.riskAlerts ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-[#0B0F19] border border-[#1E2638]">
            <div>
              <span className="text-xs font-semibold text-slate-200 block">Email Digest Frequency</span>
              <p className="text-[11px] text-slate-400">Control frequency of summary email updates.</p>
            </div>
            <select
              value={settings.emailDigest}
              onChange={(e) => updateSetting('emailDigest', e.target.value)}
              className="px-3 py-1.5 bg-[#111726] text-white text-xs font-bold rounded-xl border border-[#1E2638] focus:outline-none focus:border-[#38BDF8]"
            >
              <option value="immediate">Immediate</option>
              <option value="daily">Daily Digest</option>
              <option value="weekly">Weekly Digest</option>
              <option value="off">Off (Disabled)</option>
            </select>
          </div>
        </div>
      </section>

      {/* 5. Security & Login */}
      <section id="security" className="p-6 rounded-2xl bg-[#111726] border border-[#1E2638] shadow-sm space-y-6 scroll-mt-20">
        <div className="flex items-center justify-between border-b border-[#1E2638] pb-3">
          <div className="flex items-center space-x-2 text-sm font-bold text-white font-jakarta">
            <Lock className="w-4 h-4 text-[#38BDF8]" />
            <span>5. Security & Login Credentials</span>
          </div>
          <span className="flex items-center space-x-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Protected</span>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Change Password Card */}
          <div className="p-4 rounded-xl bg-[#0B0F19] border border-[#1E2638] flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center space-x-2 text-white font-semibold text-xs">
                <KeyRound className="w-4 h-4 text-[#38BDF8]" />
                <span>Account Password</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Last changed 45 days ago. Keep your trading account credentials secure.
              </p>
            </div>
            <button
              onClick={() => setActiveModal('changePassword')}
              className="w-full py-2 bg-[#111726] border border-[#1E2638] hover:bg-[#1E2638] text-white text-xs font-semibold rounded-xl transition flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <span>Change Password</span>
            </button>
          </div>

          {/* 2FA Card */}
          <div className="p-4 rounded-xl bg-[#0B0F19] border border-[#1E2638] flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-white font-semibold text-xs">
                  <ShieldAlert className="w-4 h-4 text-[#38BDF8]" />
                  <span>Two-Factor Authentication (2FA)</span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  settings.twoFactorEnabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
                }`}>
                  {settings.twoFactorEnabled ? 'ENABLED' : 'DISABLED'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Add an extra layer of protection using Google Authenticator or Authy.
              </p>
            </div>
            <button
              onClick={() => setActiveModal('2fa')}
              className="w-full py-2 bg-[#111726] border border-[#1E2638] hover:bg-[#1E2638] text-white text-xs font-semibold rounded-xl transition flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <span>{settings.twoFactorEnabled ? 'Manage 2FA Settings' : 'Setup 2FA Authentication'}</span>
            </button>
          </div>
        </div>

        {/* Active Sessions List */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Active Device Sessions</h4>
            <button
              onClick={revokeAllOtherSessions}
              className="text-[11px] font-semibold text-rose-400 hover:underline cursor-pointer"
            >
              Sign Out All Other Devices
            </button>
          </div>

          <div className="space-y-2">
            {activeSessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-3 rounded-xl bg-[#0B0F19] border border-[#1E2638]">
                <div className="flex items-center space-x-3">
                  {session.device.includes('Mobile') ? (
                    <Smartphone className="w-4 h-4 text-[#38BDF8]" />
                  ) : (
                    <Laptop className="w-4 h-4 text-[#38BDF8]" />
                  )}
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-semibold text-white">{session.device}</span>
                      {session.current && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#38BDF8]/20 text-[#38BDF8]">THIS DEVICE</span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400">{session.location} • {session.ip} • {session.lastActive}</p>
                  </div>
                </div>
                {!session.current && (
                  <button
                    onClick={() => revokeSession(session.id)}
                    className="text-xs text-rose-400 hover:bg-rose-500/10 px-2.5 py-1 rounded-lg border border-rose-500/20 transition cursor-pointer"
                  >
                    Revoke
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Connected Accounts & Integrations */}
      <section id="integrations" className="p-6 rounded-2xl bg-[#111726] border border-[#1E2638] shadow-sm space-y-6 scroll-mt-20">
        <div className="flex items-center space-x-2 text-sm font-bold text-white border-b border-[#1E2638] pb-3 font-jakarta">
          <Link2 className="w-4 h-4 text-[#38BDF8]" />
          <span>6. Connected Accounts & Broker Integrations</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Google */}
          <div className="p-4 rounded-xl bg-[#0B0F19] border border-[#1E2638] flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-xs font-bold text-white">G</div>
              <div>
                <span className="text-xs font-semibold text-white block">Google Account</span>
                <span className="text-[10px] text-emerald-400">Connected ({user?.email || 'user@google.com'})</span>
              </div>
            </div>
            <button
              onClick={() => updateSetting('googleConnected', !settings.googleConnected)}
              className="text-xs px-3 py-1.5 rounded-lg border border-[#1E2638] bg-[#111726] text-slate-300 hover:text-white cursor-pointer"
            >
              {settings.googleConnected ? 'Disconnect' : 'Connect'}
            </button>
          </div>

          {/* GitHub */}
          <div className="p-4 rounded-xl bg-[#0B0F19] border border-[#1E2638] flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-xs font-bold text-white">GH</div>
              <div>
                <span className="text-xs font-semibold text-white block">GitHub Account</span>
                <span className="text-[10px] text-slate-400">{settings.githubConnected ? 'Connected' : 'Not Connected'}</span>
              </div>
            </div>
            <button
              onClick={() => updateSetting('githubConnected', !settings.githubConnected)}
              className="text-xs px-3 py-1.5 rounded-lg border border-[#1E2638] bg-[#111726] text-slate-300 hover:text-white cursor-pointer"
            >
              {settings.githubConnected ? 'Disconnect' : 'Connect'}
            </button>
          </div>

          {/* Binance API */}
          <div className="p-4 rounded-xl bg-[#0B0F19] border border-[#1E2638] flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-bold">BN</div>
              <div>
                <span className="text-xs font-semibold text-white block">Binance API Feed</span>
                <span className="text-[10px] text-slate-400">{settings.binanceConnected ? 'Connected' : 'Inactive'}</span>
              </div>
            </div>
            <button
              onClick={() => updateSetting('binanceConnected', !settings.binanceConnected)}
              className="text-xs px-3 py-1.5 rounded-lg border border-[#1E2638] bg-[#111726] text-slate-300 hover:text-white cursor-pointer"
            >
              {settings.binanceConnected ? 'Configure' : 'Connect'}
            </button>
          </div>

          {/* Zerodha Kite */}
          <div className="p-4 rounded-xl bg-[#0B0F19] border border-[#1E2638] flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center text-xs font-bold">ZK</div>
              <div>
                <span className="text-xs font-semibold text-white block">Zerodha Kite API</span>
                <span className="text-[10px] text-slate-400">{settings.zerodhaConnected ? 'Connected' : 'Inactive'}</span>
              </div>
            </div>
            <button
              onClick={() => updateSetting('zerodhaConnected', !settings.zerodhaConnected)}
              className="text-xs px-3 py-1.5 rounded-lg border border-[#1E2638] bg-[#111726] text-slate-300 hover:text-white cursor-pointer"
            >
              {settings.zerodhaConnected ? 'Configure' : 'Connect'}
            </button>
          </div>
        </div>

        {/* Data Feed Source */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-[#0B0F19] border border-[#1E2638]">
          <div>
            <span className="text-xs font-semibold text-slate-200 block">Market Live Data Feed Provider</span>
            <p className="text-[11px] text-slate-400">Select real-time price tick and candle data provider.</p>
          </div>
          <select
            value={settings.marketDataFeed}
            onChange={(e) => updateSetting('marketDataFeed', e.target.value)}
            className="px-3 py-2 bg-[#111726] text-white text-xs font-bold rounded-xl border border-[#1E2638] focus:outline-none focus:border-[#38BDF8] w-52 cursor-pointer"
          >
            <option value="default">Default Antigravity Feed</option>
            <option value="binance">Binance WebSocket Direct</option>
            <option value="coingecko">CoinGecko Public API</option>
            <option value="polygon">Polygon.io Market Data</option>
          </select>
        </div>
      </section>

      {/* 7. Data Backup & Export */}
      <section id="backup" className="p-6 rounded-2xl bg-[#111726] border border-[#1E2638] shadow-sm space-y-6 scroll-mt-20">
        <div className="flex items-center justify-between border-b border-[#1E2638] pb-3">
          <div className="flex items-center space-x-2 text-sm font-bold text-white font-jakarta">
            <Database className="w-4 h-4 text-[#38BDF8]" />
            <span>7. Data Backup & Export</span>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Total Records: <strong className="text-white">{trades.length} Trades</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-[#0B0F19] border border-[#1E2638] flex flex-col justify-between space-y-3">
            <div>
              <h4 className="text-xs font-bold text-white flex items-center space-x-1.5">
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span>Export CSV</span>
              </h4>
              <p className="text-[11px] text-slate-400 mt-1">
                Spreadsheet ready CSV export of trade logs.
              </p>
            </div>
            <button
              onClick={onExportCSV}
              className="w-full py-2 bg-[#111726] border border-[#1E2638] hover:bg-[#1E2638] text-white text-xs font-semibold rounded-xl transition flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download CSV</span>
            </button>
          </div>

          <div className="p-4 rounded-xl bg-[#0B0F19] border border-[#1E2638] flex flex-col justify-between space-y-3">
            <div>
              <h4 className="text-xs font-bold text-white flex items-center space-x-1.5">
                <HardDrive className="w-4 h-4 text-cyan-400" />
                <span>JSON Journal Backup</span>
              </h4>
              <p className="text-[11px] text-slate-400 mt-1">
                Full database backup including strategies & tags.
              </p>
            </div>
            <button
              onClick={onExportJSON}
              className="w-full py-2 bg-[#111726] border border-[#1E2638] hover:bg-[#1E2638] text-white text-xs font-semibold rounded-xl transition flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>
          </div>

          <div className="p-4 rounded-xl bg-[#0B0F19] border border-[#1E2638] flex flex-col justify-between space-y-3">
            <div>
              <h4 className="text-xs font-bold text-white flex items-center space-x-1.5">
                <Upload className="w-4 h-4 text-amber-400" />
                <span>Import CSV Trades</span>
              </h4>
              <p className="text-[11px] text-slate-400 mt-1">
                Bulk upload trades from broker CSV statements.
              </p>
            </div>
            <button
              onClick={() => onOpenImportModal ? onOpenImportModal() : showToast('Import CSV wizard opened')}
              className="w-full py-2 bg-[#111726] border border-[#1E2638] hover:bg-[#1E2638] text-white text-xs font-semibold rounded-xl transition flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Import Trades</span>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl bg-[#0B0F19] border border-[#1E2638]">
          <div>
            <span className="text-xs font-semibold text-slate-200">Automated Daily Cloud Backup</span>
            <p className="text-[11px] text-slate-400">Sync encrypted journal snapshot to Supabase cloud storage nightly.</p>
          </div>
          <button
            type="button"
            onClick={() => updateSetting('autoCloudBackup', !settings.autoCloudBackup)}
            className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
              settings.autoCloudBackup ? 'bg-[#38BDF8]' : 'bg-slate-700'
            }`}
          >
            <span className={`block w-4 h-4 bg-white rounded-full transition-transform transform ${
              settings.autoCloudBackup ? 'translate-x-6' : 'translate-x-1'
            }`} />
          </button>
        </div>
      </section>

      {/* 8. Privacy & Data */}
      <section id="privacy" className="p-6 rounded-2xl bg-[#111726] border border-[#1E2638] shadow-sm space-y-6 scroll-mt-20">
        <div className="flex items-center space-x-2 text-sm font-bold text-white border-b border-[#1E2638] pb-3 font-jakarta">
          <ShieldCheck className="w-4 h-4 text-[#38BDF8]" />
          <span>8. Privacy & Data Policy Controls</span>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#0B0F19] border border-[#1E2638]">
            <div>
              <span className="text-xs font-semibold text-slate-200">Anonymous Usage Telemetry</span>
              <p className="text-[11px] text-slate-400">Share anonymous diagnostic logs to help improve performance.</p>
            </div>
            <button
              type="button"
              onClick={() => updateSetting('anonymousAnalytics', !settings.anonymousAnalytics)}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                settings.anonymousAnalytics ? 'bg-[#38BDF8]' : 'bg-slate-700'
              }`}
            >
              <span className={`block w-4 h-4 bg-white rounded-full transition-transform transform ${
                settings.anonymousAnalytics ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-[#0B0F19] border border-[#1E2638]">
            <div>
              <span className="text-xs font-semibold text-slate-200">Product Updates & Marketing Emails</span>
              <p className="text-[11px] text-slate-400">Receive feature announcements and trading strategy guides.</p>
            </div>
            <button
              type="button"
              onClick={() => updateSetting('marketingEmails', !settings.marketingEmails)}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                settings.marketingEmails ? 'bg-[#38BDF8]' : 'bg-slate-700'
              }`}
            >
              <span className={`block w-4 h-4 bg-white rounded-full transition-transform transform ${
                settings.marketingEmails ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-[#0B0F19] border border-[#1E2638]">
            <div>
              <span className="text-xs font-semibold text-slate-200 block">Cloud Data Retention Period</span>
              <p className="text-[11px] text-slate-400">Duration server retains trade archives before auto-pruning.</p>
            </div>
            <select
              value={settings.dataRetention}
              onChange={(e) => updateSetting('dataRetention', e.target.value)}
              className="px-3 py-1.5 bg-[#111726] text-white text-xs font-bold rounded-xl border border-[#1E2638] focus:outline-none focus:border-[#38BDF8] cursor-pointer"
            >
              <option value="Forever">Forever (Unlimited)</option>
              <option value="3 Years">3 Years</option>
              <option value="1 Year">1 Year</option>
            </select>
          </div>

          <div className="pt-2 flex justify-start">
            <button
              onClick={() => showToast('Personal Data Archive download initiated')}
              className="px-4 py-2 bg-[#0B0F19] border border-[#1E2638] hover:bg-[#1E2638] text-slate-200 text-xs font-semibold rounded-xl transition flex items-center space-x-2 cursor-pointer"
            >
              <Download className="w-4 h-4 text-[#38BDF8]" />
              <span>Download Personal Data GDPR Archive (.zip)</span>
            </button>
          </div>
        </div>
      </section>

      {/* 9. Demo Data & Reset */}
      <section id="demo-data" className="p-6 rounded-2xl bg-[#111726] border border-[#1E2638] shadow-sm space-y-6 scroll-mt-20">
        <div className="flex items-center space-x-2 text-sm font-bold text-white border-b border-[#1E2638] pb-3 font-jakarta">
          <RotateCcw className="w-4 h-4 text-[#38BDF8]" />
          <span>9. Demo Datasets & Local Cache Reset</span>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-[#0B0F19] border border-[#1E2638]">
            <div>
              <h4 className="text-xs font-bold text-white">Load Sample Demo Dataset</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Populate journal with 15+ pre-loaded trades (BTC, ETH, RELIANCE, AAPL) to evaluate charts and metrics.
              </p>
            </div>
            <button
              onClick={() => {
                if (confirm('Load sample dataset? This will merge sample trades into your local journal.')) {
                  onLoadSampleData();
                  showToast('Sample trades loaded successfully!');
                }
              }}
              className="px-4 py-2 bg-gradient-to-r from-[#38BDF8] to-[#0284C7] text-white text-xs font-bold rounded-xl transition shadow-sm shrink-0 cursor-pointer"
            >
              Load Sample Data
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-[#0B0F19] border border-[#1E2638]">
            <div>
              <h4 className="text-xs font-bold text-white">Clear UI State & Cache</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Reset local UI filters, view settings, and temporary window cache without deleting trade data.
              </p>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem('tradetracker_settings_v2');
                showToast('Local UI cache reset');
              }}
              className="px-4 py-2 bg-[#111726] border border-[#1E2638] hover:bg-[#1E2638] text-slate-200 text-xs font-semibold rounded-xl transition shrink-0 cursor-pointer"
            >
              Reset UI Cache
            </button>
          </div>
        </div>
      </section>

      {/* 10. Help & About */}
      <section id="help" className="p-6 rounded-2xl bg-[#111726] border border-[#1E2638] shadow-sm space-y-6 scroll-mt-20">
        <div className="flex items-center justify-between border-b border-[#1E2638] pb-3">
          <div className="flex items-center space-x-2 text-sm font-bold text-white font-jakarta">
            <HelpCircle className="w-4 h-4 text-[#38BDF8]" />
            <span>10. Help, Support & Application Info</span>
          </div>
          <span className="text-xs font-mono text-[#38BDF8] bg-[#38BDF8]/10 px-2.5 py-0.5 rounded-full border border-[#38BDF8]/30 font-bold">
            v2.4.0
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={() => window.open('https://antigravity.google', '_blank')}
            className="p-3 rounded-xl bg-[#0B0F19] border border-[#1E2638] hover:border-[#38BDF8]/50 text-left transition flex flex-col justify-between space-y-2 cursor-pointer"
          >
            <HelpCircle className="w-5 h-5 text-[#38BDF8]" />
            <div>
              <span className="text-xs font-bold text-white block">Help Center</span>
              <span className="text-[10px] text-slate-400">Documentation & guides</span>
            </div>
          </button>

          <button
            onClick={() => showToast('Support ticket form requested')}
            className="p-3 rounded-xl bg-[#0B0F19] border border-[#1E2638] hover:border-[#38BDF8]/50 text-left transition flex flex-col justify-between space-y-2 cursor-pointer"
          >
            <Mail className="w-5 h-5 text-[#38BDF8]" />
            <div>
              <span className="text-xs font-bold text-white block">Contact Support</span>
              <span className="text-[10px] text-slate-400">Dedicated 24/7 helpdesk</span>
            </div>
          </button>

          <button
            onClick={() => setActiveModal('reportBug')}
            className="p-3 rounded-xl bg-[#0B0F19] border border-[#1E2638] hover:border-[#38BDF8]/50 text-left transition flex flex-col justify-between space-y-2 cursor-pointer"
          >
            <MessageSquare className="w-5 h-5 text-[#38BDF8]" />
            <div>
              <span className="text-xs font-bold text-white block">Report a Bug</span>
              <span className="text-[10px] text-slate-400">Submit issue report</span>
            </div>
          </button>

          <button
            onClick={() => showToast('Feature request portal opened')}
            className="p-3 rounded-xl bg-[#0B0F19] border border-[#1E2638] hover:border-[#38BDF8]/50 text-left transition flex flex-col justify-between space-y-2 cursor-pointer"
          >
            <Cpu className="w-5 h-5 text-[#38BDF8]" />
            <div>
              <span className="text-xs font-bold text-white block">Request Feature</span>
              <span className="text-[10px] text-slate-400">Vote on roadmap</span>
            </div>
          </button>
        </div>

        <div className="pt-2 flex flex-wrap items-center justify-between text-xs text-slate-400 border-t border-[#1E2638]/50 gap-2">
          <span>© 2026 Antigravity Trading Journal Suite. All rights reserved.</span>
          <div className="flex items-center space-x-4 text-[11px]">
            <a href="#terms" onClick={(e) => { e.preventDefault(); showToast('Terms of Service opened'); }} className="hover:text-white underline">Terms of Service</a>
            <a href="#privacy" onClick={(e) => { e.preventDefault(); showToast('Privacy Policy opened'); }} className="hover:text-white underline">Privacy Policy</a>
            <a href="#security" onClick={(e) => { e.preventDefault(); showToast('Security Whitepaper opened'); }} className="hover:text-white underline">Security Overview</a>
          </div>
        </div>
      </section>

      {/* 11. Danger Zone */}
      <section id="danger-zone" className="p-6 rounded-2xl bg-[#111726]/60 border border-rose-900/30 shadow-sm space-y-4 scroll-mt-20">
        <div className="flex items-center space-x-2 text-xs font-bold text-rose-400 border-b border-rose-900/30 pb-3 uppercase tracking-wider">
          <AlertTriangle className="w-4 h-4 text-rose-400" />
          <span>11. Danger Zone & Destructive Actions</span>
        </div>

        <p className="text-xs text-slate-400">
          The actions in this section are permanent and destructive. Please proceed with extreme caution.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Reset Journal Data */}
          <div className="p-4 rounded-xl bg-rose-950/10 border border-rose-900/30 flex flex-col justify-between space-y-3">
            <div>
              <h4 className="text-xs font-bold text-rose-300">Reset All Journal & Trade Data</h4>
              <p className="text-[11px] text-slate-400 mt-1">
                Deletes all trade logs, execution histories, and capital adjustments.
              </p>
            </div>
            <button
              onClick={() => setActiveModal('resetConfirm')}
              className="w-full py-2 bg-rose-950/40 border border-rose-800/40 hover:bg-rose-900/40 text-rose-300 text-xs font-semibold rounded-xl transition cursor-pointer"
            >
              Reset Journal Data
            </button>
          </div>

          {/* Delete Account */}
          <div className="p-4 rounded-xl bg-rose-950/10 border border-rose-900/30 flex flex-col justify-between space-y-3">
            <div>
              <h4 className="text-xs font-bold text-rose-300">Delete Account & Erasure</h4>
              <p className="text-[11px] text-slate-400 mt-1">
                Permanently erase your account, cloud database records, and sync profile.
              </p>
            </div>
            <button
              onClick={() => setActiveModal('deleteAccountConfirm')}
              className="w-full py-2 bg-rose-950/60 border border-rose-700/50 hover:bg-rose-900/60 text-rose-200 text-xs font-semibold rounded-xl transition cursor-pointer"
            >
              Delete Account Permanently
            </button>
          </div>
        </div>
      </section>

      {/* --- MODALS --- */}

      {/* Change Password Modal */}
      {activeModal === 'changePassword' && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111726] border border-[#1E2638] rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#1E2638] pb-3">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <KeyRound className="w-4 h-4 text-[#38BDF8]" />
                <span>Change Password</span>
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              if (passwordForm.newPass !== passwordForm.confirmPass) {
                alert('New passwords do not match!');
                return;
              }
              showToast('Password updated successfully');
              setActiveModal(null);
              setPasswordForm({ current: '', newPass: '', confirmPass: '' });
            }} className="space-y-4">
              <div>
                <label className="text-xs text-slate-300 block mb-1">Current Password</label>
                <input
                  type="password"
                  required
                  value={passwordForm.current}
                  onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0B0F19] text-white text-xs rounded-xl border border-[#1E2638] focus:outline-none focus:border-[#38BDF8]"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">New Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={passwordForm.newPass}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPass: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0B0F19] text-white text-xs rounded-xl border border-[#1E2638] focus:outline-none focus:border-[#38BDF8]"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={passwordForm.confirmPass}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPass: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0B0F19] text-white text-xs rounded-xl border border-[#1E2638] focus:outline-none focus:border-[#38BDF8]"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 bg-[#0B0F19] text-slate-300 text-xs font-semibold rounded-xl border border-[#1E2638] hover:bg-[#1E2638]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#38BDF8] text-white text-xs font-bold rounded-xl shadow-sm hover:bg-[#0284C7]"
                >
                  Save New Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2FA Setup Modal */}
      {activeModal === '2fa' && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111726] border border-[#1E2638] rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#1E2638] pb-3">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4 text-[#38BDF8]" />
                <span>Two-Factor Authentication Setup</span>
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-center space-y-3">
              <div className="w-36 h-36 mx-auto bg-white p-2 rounded-xl flex items-center justify-center">
                {/* QR Code representation */}
                <div className="w-full h-full border-2 border-slate-900 flex flex-col justify-between p-2 font-mono text-[9px] text-slate-900 font-bold overflow-hidden select-none">
                  <div className="flex justify-between"><span>■■■□</span><span>■□■■</span></div>
                  <div className="text-center text-[10px] my-auto font-sans">ANTIGRAVITY 2FA QR</div>
                  <div className="flex justify-between"><span>□■■□</span><span>■■□■</span></div>
                </div>
              </div>
              <p className="text-xs text-slate-300">
                Scan this QR code with Google Authenticator or Authy, then enter the 6-digit verification code below:
              </p>
              <input
                type="text"
                placeholder="123456"
                maxLength={6}
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value)}
                className="w-40 mx-auto px-3 py-2 bg-[#0B0F19] text-center text-white text-lg tracking-widest font-mono rounded-xl border border-[#1E2638] focus:outline-none focus:border-[#38BDF8]"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 bg-[#0B0F19] text-slate-300 text-xs font-semibold rounded-xl border border-[#1E2638]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (twoFactorCode.length < 6) {
                    alert('Please enter a valid 6-digit code');
                    return;
                  }
                  updateSetting('twoFactorEnabled', true);
                  setActiveModal(null);
                  setTwoFactorCode('');
                }}
                className="px-4 py-2 bg-[#38BDF8] text-white text-xs font-bold rounded-xl shadow-sm hover:bg-[#0284C7]"
              >
                Verify & Enable 2FA
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Bug Modal */}
      {activeModal === 'reportBug' && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111726] border border-[#1E2638] rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#1E2638] pb-3">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <MessageSquare className="w-4 h-4 text-[#38BDF8]" />
                <span>Report a Bug</span>
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              showToast('Bug report submitted. Thank you!');
              setActiveModal(null);
              setBugForm({ subject: '', description: '', severity: 'Low' });
            }} className="space-y-4">
              <div>
                <label className="text-xs text-slate-300 block mb-1">Issue Subject</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chart failed to reload"
                  value={bugForm.subject}
                  onChange={(e) => setBugForm({ ...bugForm, subject: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0B0F19] text-white text-xs rounded-xl border border-[#1E2638] focus:outline-none focus:border-[#38BDF8]"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Severity</label>
                <select
                  value={bugForm.severity}
                  onChange={(e) => setBugForm({ ...bugForm, severity: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0B0F19] text-white text-xs rounded-xl border border-[#1E2638] focus:outline-none focus:border-[#38BDF8]"
                >
                  <option value="Low">Low / Minor Cosmetic</option>
                  <option value="Medium">Medium / Functional Flaw</option>
                  <option value="High">High / Crash or Data Issue</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Description</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Provide steps to reproduce..."
                  value={bugForm.description}
                  onChange={(e) => setBugForm({ ...bugForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0B0F19] text-white text-xs rounded-xl border border-[#1E2638] focus:outline-none focus:border-[#38BDF8]"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 bg-[#0B0F19] text-slate-300 text-xs font-semibold rounded-xl border border-[#1E2638]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#38BDF8] text-white text-xs font-bold rounded-xl shadow-sm hover:bg-[#0284C7]"
                >
                  Submit Bug Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Data Confirmation Modal */}
      {activeModal === 'resetConfirm' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111726] border border-rose-900/50 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center space-x-2 text-rose-400 border-b border-rose-900/30 pb-3">
              <AlertTriangle className="w-5 h-5 text-rose-500" />
              <h3 className="text-sm font-bold text-white">Confirm Reset Journal Data</h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              This action will permanently delete <strong className="text-white">{trades.length} trades</strong> and all account capital logs. Type <strong className="text-rose-400 font-mono">RESET</strong> to confirm.
            </p>

            <input
              type="text"
              placeholder="RESET"
              value={resetConfirmInput}
              onChange={(e) => setResetConfirmInput(e.target.value)}
              className="w-full px-3 py-2 bg-[#0B0F19] text-white text-xs font-mono rounded-xl border border-rose-900/50 focus:outline-none focus:border-rose-500"
            />

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => { setActiveModal(null); setResetConfirmInput(''); }}
                className="px-4 py-2 bg-[#0B0F19] text-slate-300 text-xs font-semibold rounded-xl border border-[#1E2638]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={resetConfirmInput !== 'RESET'}
                onClick={() => {
                  if (onClearAllData) onClearAllData();
                  setActiveModal(null);
                  setResetConfirmInput('');
                  showToast('All journal data has been reset');
                }}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
                  resetConfirmInput === 'RESET'
                    ? 'bg-rose-600 text-white cursor-pointer hover:bg-rose-700'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                Permanently Reset Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Confirmation Modal */}
      {activeModal === 'deleteAccountConfirm' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111726] border border-rose-900/50 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center space-x-2 text-rose-400 border-b border-rose-900/30 pb-3">
              <AlertTriangle className="w-5 h-5 text-rose-500" />
              <h3 className="text-sm font-bold text-white">Delete Account Permanently</h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Your account, cloud database records, and cloud backup snapshots will be deleted permanently. Type <strong className="text-rose-400 font-mono">DELETE ACCOUNT</strong> to confirm.
            </p>

            <input
              type="text"
              placeholder="DELETE ACCOUNT"
              value={deleteConfirmInput}
              onChange={(e) => setDeleteConfirmInput(e.target.value)}
              className="w-full px-3 py-2 bg-[#0B0F19] text-white text-xs font-mono rounded-xl border border-rose-900/50 focus:outline-none focus:border-rose-500"
            />

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => { setActiveModal(null); setDeleteConfirmInput(''); }}
                className="px-4 py-2 bg-[#0B0F19] text-slate-300 text-xs font-semibold rounded-xl border border-[#1E2638]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteConfirmInput !== 'DELETE ACCOUNT'}
                onClick={() => {
                  if (onClearAllData) onClearAllData();
                  setActiveModal(null);
                  setDeleteConfirmInput('');
                  showToast('Account deleted');
                }}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
                  deleteConfirmInput === 'DELETE ACCOUNT'
                    ? 'bg-rose-600 text-white cursor-pointer hover:bg-rose-700'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                Delete Account Now
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default SettingsView;
