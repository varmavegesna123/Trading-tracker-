import React, { useState, useMemo } from 'react';
import { Calendar, Plus, Menu, LogIn, LogOut, Sun, Moon } from 'lucide-react';
import { GlassCalendarPickerModal } from './GlassCalendarPickerModal';

export function Header({ 
  currentTab, 
  user,
  onOpenTradeModal, 
  onOpenAuthModal,
  onLogout,
  mobileMenuOpen,
  setMobileMenuOpen,
  darkMode = true,
  onToggleDarkMode,
  trades = []
}) {
  const [isCalendarPickerOpen, setIsCalendarPickerOpen] = useState(false);
  const [customRange, setCustomRange] = useState(null);

  const titles = {
    dashboard: 'Dashboard',
    trades: 'Trades',
    analytics: 'Analytics',
    calendar: 'Calendar',
    strategies: 'Strategies',
    reports: 'Reports',
    goals: 'Goals',
    journal: 'Journal',
    notes: 'Notes',
    settings: 'Settings'
  };

  const firstName = user?.name ? user.name.split(' ')[0] : 'Trader';

  // Dynamic time of day greeting
  const timeGreeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  // Compute dynamic date range label
  const dateRangeLabel = useMemo(() => {
    if (customRange?.startDate && customRange?.endDate) {
      return `${customRange.startDate} – ${customRange.endDate}`;
    }
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 6);

    const formatOpt = { month: 'short', day: 'numeric' };
    const startStr = sevenDaysAgo.toLocaleDateString('en-US', formatOpt);
    const endStr = today.toLocaleDateString('en-US', { ...formatOpt, year: 'numeric' });

    return `${startStr} – ${endStr}`;
  }, [customRange]);

  return (
    <>
      <header className="h-20 border-b border-[#1E2638] bg-[#0B0F19]/90 backdrop-blur-md sticky top-0 z-20 px-6 lg:px-8 flex items-center justify-between">
        {/* Title & Greeting */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-[#111726]"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-extrabold text-[#38BDF8] font-jakarta tracking-tight">
              {titles[currentTab] || 'Dashboard'}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">
              {timeGreeting}, {firstName}! Welcome to your trading workspace.
            </p>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center space-x-3">
          
          {/* Glassy Interactive Theme Mode Toggle Button */}
          {onToggleDarkMode && (
            <button
              onClick={onToggleDarkMode}
              className="p-2.5 rounded-xl border border-[#1E2638] bg-[#111726] hover:bg-[#1E2638] transition-all flex items-center justify-center cursor-pointer shadow-sm group"
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {darkMode ? (
                <Sun className="w-4 h-4 text-amber-400 group-hover:rotate-45 transition-transform" />
              ) : (
                <Moon className="w-4 h-4 text-sky-500 group-hover:-rotate-12 transition-transform" />
              )}
            </button>
          )}

          {/* Glassy Interactive Calendar Date Range Button */}
          <button
            onClick={() => setIsCalendarPickerOpen(true)}
            className="hidden sm:flex items-center space-x-2 px-3.5 py-2 glass-box rounded-xl text-xs font-semibold text-slate-200 cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>{dateRangeLabel}</span>
            <span className="text-slate-500 text-[10px]">▼</span>
          </button>

          {/* + New Trade Button */}
          <button
            onClick={onOpenTradeModal}
            className="bg-gradient-to-r from-[#38BDF8] to-[#0284C7] hover:from-[#0284C7] hover:to-[#0369A1] text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition shadow-lg shadow-sky-500/20 flex items-center space-x-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>New Trade</span>
          </button>

          {/* Auth State Button */}
          {user ? (
            <button
              onClick={onLogout}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-[#111726] transition"
              title="Log Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="px-3 py-2 bg-[#111726] border border-[#1E2638] text-[#38BDF8] text-xs font-bold rounded-xl hover:bg-[#1E2638]"
            >
              Log In
            </button>
          )}

        </div>
      </header>

      {/* Glassy Interactive Date Range & Time Picker Modal */}
      <GlassCalendarPickerModal
        isOpen={isCalendarPickerOpen}
        onClose={() => setIsCalendarPickerOpen(false)}
        trades={trades}
        onSelectRange={(range) => setCustomRange(range)}
      />
    </>
  );
}
