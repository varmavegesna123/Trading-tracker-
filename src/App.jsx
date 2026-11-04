import React, { useState, useEffect, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { TradeModal } from './components/TradeModal';
import { CapitalModal } from './components/CapitalModal';
import { PositionCalculatorModal } from './components/PositionCalculatorModal';
import { CSVImportModal } from './components/CSVImportModal';
import { ChartLightboxModal } from './components/ChartLightboxModal';
import { PreTradeChecklistModal } from './components/PreTradeChecklistModal';
import { AuthModal } from './components/AuthModal';

import { DashboardView } from './views/DashboardView';
import { TradeLogView } from './views/TradeLogView';
import { CalendarView } from './views/CalendarView';
import { CapitalTrackerView } from './views/CapitalTrackerView';
import { AnalyticsView } from './views/AnalyticsView';
import { SettingsView } from './views/SettingsView';
import { StrategiesView } from './views/StrategiesView';
import { ReportsView } from './views/ReportsView';
import { GoalsView } from './views/GoalsView';
import { JournalView } from './views/JournalView';
import { NotesView } from './views/NotesView';

import { storageService } from './services/storage';
import { authService } from './services/auth';
import { calculateTradePnL } from './utils/formatters';

export function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [trades, setTrades] = useState([]);
  const [capitalLogs, setCapitalLogs] = useState([]);
  const [settings, setSettings] = useState({ currency: 'INR' });
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true;
  });

  // Modal States
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
  const [tradeToEdit, setTradeToEdit] = useState(null);
  const [initialConfluences, setInitialConfluences] = useState(null);
  const [isCapitalModalOpen, setIsCapitalModalOpen] = useState(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isPreTradeChecklistOpen, setIsPreTradeChecklistOpen] = useState(false);
  const [selectedChartTrade, setSelectedChartTrade] = useState(null);

  // Layout States
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Initial Data & Backend Persistence Load
  useEffect(() => {
    let isMounted = true;

    const loadUserData = async (activeUser) => {
      setUser(activeUser);
      if (activeUser) {
        // Immediately load any cached trades for this user
        setTrades(storageService.getTrades());
        setCapitalLogs(storageService.getCapitalLogs());
        setSettings(storageService.getSettings());

        // Fetch & sync with backend database
        await storageService.fetchFromBackend();
        if (!isMounted) return;
        setTrades(storageService.getTrades());
        setCapitalLogs(storageService.getCapitalLogs());
        setSettings(storageService.getSettings());
      }
      setAuthReady(true);
    };

    const initData = async () => {
      const restoredUser = await authService.restoreSession();
      if (!isMounted) return;
      if (restoredUser) {
        await loadUserData(restoredUser);
      } else {
        setAuthReady(true);
      }
    };

    initData();

    // Listen for auth state changes (crucial for OAuth redirects like Google)
    const { data: authListener } = authService.onAuthStateChange(async (event, authUser) => {
      if (!isMounted) return;
      if (authUser && (event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'TOKEN_REFRESHED')) {
        await loadUserData(authUser);
        if (window.location.search || window.location.hash) {
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setTrades([]);
        setCapitalLogs([]);
      }
    });

    return () => {
      isMounted = false;
      authListener?.subscription?.unsubscribe?.();
    };
  }, []);

  // Sync Dark Mode class on html element & localStorage with synchronized transition
  useEffect(() => {
    document.documentElement.classList.add('theme-transitioning');
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }

    const timer = setTimeout(() => {
      document.documentElement.classList.remove('theme-transitioning');
    }, 150);

    return () => clearTimeout(timer);
  }, [darkMode]);

  const handleToggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  // Auth Handlers
  const handleAuthSuccess = async (loggedUser) => {
    setUser(loggedUser);
    // Immediately display any cached trades
    setTrades(storageService.getTrades());
    setCapitalLogs(storageService.getCapitalLogs());
    setSettings(storageService.getSettings());

    // Fetch from backend database
    await storageService.fetchFromBackend();
    setTrades(storageService.getTrades());
    setCapitalLogs(storageService.getCapitalLogs());
    setSettings(storageService.getSettings());
  };

  const handleLogout = async () => {
    try {
      await storageService.syncNow();
    } catch (e) {}
    await authService.logout();
    setUser(null);
    setTrades([]);
    setCapitalLogs([]);
    setSettings({ currency: 'INR' });
    setCurrentTab('dashboard');
  };

  const handleSaveTrade = (tradeData) => {
    try {
      let updatedTrades = [];
      const index = trades.findIndex(t => t && t.id === tradeData.id);
      if (index >= 0) {
        updatedTrades = [...trades];
        updatedTrades[index] = tradeData;
      } else {
        updatedTrades = [tradeData, ...trades];
      }
      setTrades(updatedTrades);
      setTradeToEdit(null);
      storageService.saveTrades(updatedTrades);
      setCurrentTab('trades');
    } catch (err) {
      console.error('Error during trade save execution:', err);
    }
  };

  const handleDeleteTrade = (tradeId) => {
    const updated = trades.filter(t => t.id !== tradeId);
    setTrades(updated);
    storageService.saveTrades(updated);
  };

  const handleEditTrade = (trade) => {
    setTradeToEdit(trade);
    setInitialConfluences(null);
    setIsTradeModalOpen(true);
  };

  const handleOpenNewTradeModal = () => {
    setTradeToEdit(null);
    setInitialConfluences(null);
    setIsTradeModalOpen(true);
  };

  const handleProceedFromChecklist = (data) => {
    setTradeToEdit(null);
    setInitialConfluences(data);
    setIsTradeModalOpen(true);
  };

  const handleImportTrades = (newTrades) => {
    const combined = [...newTrades, ...trades];
    setTrades(combined);
    storageService.saveTrades(combined);
    setCurrentTab('trades');
  };

  const handleSaveCapital = (logData) => {
    const updated = [logData, ...capitalLogs];
    setCapitalLogs(updated);
    storageService.saveCapitalLogs(updated);
  };

  const handleSetCurrency = (newCurrency) => {
    const updated = { ...settings, currency: newCurrency };
    setSettings(updated);
    storageService.saveSettings(updated);
  };

  const handleLoadSampleData = () => {
    const res = storageService.loadSampleData();
    setTrades(res.trades);
    setCapitalLogs(res.capitalLogs);
  };

  const handleClearAllData = () => {
    storageService.clearAll();
    setTrades([]);
    setCapitalLogs([]);
  };

  const { totalEquity, netPnL } = useMemo(() => {
    let totalDeposits = capitalLogs.filter(c => c.type === 'DEPOSIT').reduce((acc, c) => acc + (Number(c.amount) || 0), 0);
    let totalWithdrawals = capitalLogs.filter(c => c.type === 'WITHDRAWAL').reduce((acc, c) => acc + (Number(c.amount) || 0), 0);
    const netCapital = totalDeposits - totalWithdrawals;

    let pnl = 0;
    trades.filter(t => t.status === 'CLOSED').forEach(t => {
      pnl += calculateTradePnL(t).pnlAmount;
    });

    return {
      totalEquity: netCapital + pnl,
      netPnL: pnl
    };
  }, [trades, capitalLogs]);

  if (!authReady) {
    return <div className="min-h-screen bg-[#0B0F19]" aria-busy="true" />;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0B0F19]" aria-label="Authentication required">
        <AuthModal
          isOpen
          onClose={() => {}}
          onAuthSuccess={handleAuthSuccess}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex font-sans selection:bg-[#38BDF8] selection:text-white">
      
      {/* Desktop Sidebar Navigation */}
      <div className="hidden lg:block">
        <Sidebar
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          user={user}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          onLogout={handleLogout}
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
          darkMode={darkMode}
          onToggleDarkMode={handleToggleDarkMode}
        />
      </div>

      {/* Mobile Menu Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden flex">
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="relative w-64 bg-[#0B0F19] h-full shadow-2xl z-50">
            <Sidebar
              currentTab={currentTab}
              setCurrentTab={(tab) => {
                setCurrentTab(tab);
                setMobileMenuOpen(false);
              }}
              user={user}
              onOpenAuthModal={() => {
                setIsAuthModalOpen(true);
                setMobileMenuOpen(false);
              }}
              onLogout={() => {
                handleLogout();
                setMobileMenuOpen(false);
              }}
              collapsed={false}
              setCollapsed={() => {}}
              darkMode={darkMode}
              onToggleDarkMode={handleToggleDarkMode}
            />
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className={`flex-1 flex flex-col min-w-0 transition-[margin] duration-300 ${
        sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
      }`}>
        
        {/* Global Header */}
        <Header
          currentTab={currentTab}
          user={user}
          onOpenTradeModal={handleOpenNewTradeModal}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          onLogout={handleLogout}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          darkMode={darkMode}
          onToggleDarkMode={handleToggleDarkMode}
          trades={trades}
        />

        {/* View Router */}
        <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto">
          {currentTab === 'dashboard' && (
            <DashboardView
              trades={trades}
              capitalLogs={capitalLogs}
              currency={settings.currency}
              onOpenTradeModal={handleOpenNewTradeModal}
              onOpenCapitalModal={() => setIsCapitalModalOpen(true)}
              onOpenCalculator={() => setIsCalculatorOpen(true)}
              onOpenImportModal={() => setIsImportModalOpen(true)}
              onViewTradeChart={(trade) => setSelectedChartTrade(trade)}
              setCurrentTab={setCurrentTab}
            />
          )}

          {currentTab === 'trades' && (
            <TradeLogView
              trades={trades}
              currency={settings.currency}
              onOpenTradeModal={handleOpenNewTradeModal}
              onOpenPreTradeChecklist={() => setIsPreTradeChecklistOpen(true)}
              onEditTrade={handleEditTrade}
              onDeleteTrade={handleDeleteTrade}
              onExportCSV={storageService.exportTradesCSV}
              onOpenImportModal={() => setIsImportModalOpen(true)}
              onViewTradeChart={(trade) => setSelectedChartTrade(trade)}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
            />
          )}

          {currentTab === 'analytics' && (
            <AnalyticsView
              trades={trades}
              currency={settings.currency}
            />
          )}

          {currentTab === 'calendar' && (
            <CalendarView
              trades={trades}
              currency={settings.currency}
              onEditTrade={handleEditTrade}
            />
          )}

          {currentTab === 'strategies' && (
            <StrategiesView
              trades={trades}
              currency={settings.currency}
              onOpenTradeModal={handleOpenNewTradeModal}
            />
          )}

          {currentTab === 'reports' && (
            <ReportsView
              trades={trades}
              currency={settings.currency}
              onExportCSV={storageService.exportTradesCSV}
              onExportJSON={storageService.exportDataJSON}
            />
          )}

          {currentTab === 'goals' && (
            <GoalsView
              key={`goals-${user?.id || user?.email || 'signed-out'}`}
              trades={trades}
              currency={settings.currency}
              user={user}
            />
          )}

          {currentTab === 'journal' && (
            <JournalView key={`journal-${user?.id || user?.email || 'signed-out'}`} user={user} />
          )}

          {currentTab === 'notes' && (
            <NotesView />
          )}

          {currentTab === 'capital' && (
            <CapitalTrackerView
              trades={trades}
              capitalLogs={capitalLogs}
              currency={settings.currency}
              onOpenCapitalModal={() => setIsCapitalModalOpen(true)}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsView
              currency={settings.currency}
              setCurrency={handleSetCurrency}
              darkMode={darkMode}
              setDarkMode={setDarkMode}
              onLoadSampleData={handleLoadSampleData}
              onClearAllData={handleClearAllData}
              onExportCSV={storageService.exportTradesCSV}
              onExportJSON={storageService.exportDataJSON}
              user={user}
              trades={trades}
              onOpenImportModal={() => setIsImportModalOpen(true)}
              setCurrentTab={setCurrentTab}
            />
          )}
        </main>
      </div>

      {/* Global Dialog Modals */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      <TradeModal
        isOpen={isTradeModalOpen}
        onClose={() => setIsTradeModalOpen(false)}
        onSave={handleSaveTrade}
        onDelete={handleDeleteTrade}
        tradeToEdit={tradeToEdit}
        initialConfluences={initialConfluences}
        currency={settings.currency}
        darkMode={darkMode}
      />

      <PreTradeChecklistModal
        isOpen={isPreTradeChecklistOpen}
        onClose={() => setIsPreTradeChecklistOpen(false)}
        onProceedToLogTrade={handleProceedFromChecklist}
      />

      <CapitalModal
        isOpen={isCapitalModalOpen}
        onClose={() => setIsCapitalModalOpen(false)}
        onSave={handleSaveCapital}
        currency={settings.currency}
      />

      <PositionCalculatorModal
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
        totalEquity={totalEquity}
        currency={settings.currency}
      />

      <CSVImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={handleImportTrades}
      />

      <ChartLightboxModal
        isOpen={Boolean(selectedChartTrade)}
        onClose={() => setSelectedChartTrade(null)}
        trade={selectedChartTrade}
        currency={settings.currency}
      />

    </div>
  );
}

export default App;
