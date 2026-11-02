import React from 'react';
import { BrandLogo } from './BrandLogo';
import { 
  LayoutDashboard, 
  ArrowRightLeft, 
  BarChart3, 
  Calendar as CalendarIcon, 
  Layers, 
  FileText, 
  Target, 
  BookOpen, 
  FileCode, 
  Settings, 
  Crown,
  ChevronDown,
  Sun,
  Moon,
  HelpCircle,
  Zap,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export function Sidebar({ 
  currentTab, 
  setCurrentTab, 
  user, 
  onOpenAuthModal,
  collapsed,
  setCollapsed,
  darkMode = true,
  onToggleDarkMode
}) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'trades', label: 'Trades', icon: ArrowRightLeft },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'calendar', label: 'Calendar', icon: CalendarIcon },
    { id: 'strategies', label: 'Strategies', icon: Layers },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'goals', label: 'Goals', icon: Target },
    { id: 'journal', label: 'Journal', icon: BookOpen },
    { id: 'notes', label: 'Notes', icon: FileCode },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside 
      className={`fixed top-0 left-0 h-screen bg-[#0B0F19] border-r border-[#1E2638] transition-[width] duration-300 z-30 flex flex-col justify-between ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Top Header & Navigation */}
      <div>
        {/* Brand Header */}
        <div className={`h-20 flex items-center border-b border-[#1E2638] ${
          collapsed ? 'justify-center px-0' : 'justify-between px-5'
        }`}>
          {collapsed ? (
            <button
              onClick={() => setCollapsed(false)}
              className="group relative w-10 h-10 rounded-xl bg-gradient-to-br from-[#38BDF8] to-[#0284C7] flex items-center justify-center text-white shadow-lg shadow-sky-500/20 hover:scale-105 transition cursor-pointer"
              title="Expand sidebar"
            >
              <BrandLogo className="w-5 h-5 text-white group-hover:hidden transition" />
              <ChevronRight className="w-5 h-5 text-white hidden group-hover:block transition" />
            </button>
          ) : (
            <>
              <div className="flex items-center space-x-3 overflow-hidden min-w-0">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#38BDF8] to-[#0284C7] flex items-center justify-center text-white shadow-lg shadow-sky-500/20 shrink-0">
                  <BrandLogo className="w-5 h-5 text-white" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-extrabold text-[#0284C7] dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-[#38BDF8] dark:to-[#0284C7] text-sm font-brand tracking-tight leading-tight whitespace-nowrap truncate">
                    Trading Journal
                  </span>
                  <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap truncate">
                    Track. Analyze. Improve.
                  </span>
                </div>
              </div>

              <button 
                onClick={() => setCollapsed(true)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1E2638] transition cursor-pointer shrink-0 ml-2"
                title="Collapse sidebar"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

        {/* Navigation List */}
        <nav className={`space-y-1.5 mt-2 ${collapsed ? 'px-2 py-2' : 'p-3'}`}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`transition cursor-pointer ${
                  collapsed
                    ? `w-10 h-10 rounded-xl flex items-center justify-center mx-auto ${
                        isActive
                          ? 'bg-[#38BDF8] text-white shadow-md shadow-sky-500/20'
                          : 'text-slate-400 hover:bg-[#111726] hover:text-slate-200'
                      }`
                    : `w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-bold ${
                        isActive
                          ? 'bg-[#38BDF8] text-white shadow-md shadow-sky-500/20'
                          : 'text-slate-400 hover:bg-[#111726] hover:text-slate-200'
                      }`
                }`}
                title={collapsed ? item.label : undefined}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                {!collapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Area: Hidden/Compact when collapsed */}
      {!collapsed && (
        <div className="p-3 space-y-3">
          {/* Upgrade to Pro Card */}
          <div className="p-4 rounded-2xl bg-[#111726]/90 border border-[#1E2638] space-y-2.5 relative overflow-hidden">
            <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold font-jakarta">
              <Crown className="w-4 h-4" />
              <span>Pro Plan Active</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              Advanced SMC analytics & live journal tracking enabled.
            </p>
          </div>

          {/* User Profile Card */}
          <div 
            onClick={onOpenAuthModal}
            className="p-2.5 rounded-xl bg-[#111726]/80 border border-[#1E2638] flex items-center justify-between cursor-pointer hover:bg-[#1E2638] transition"
          >
            <div className="flex items-center space-x-3 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 text-white font-bold text-xs flex items-center justify-center font-mono shrink-0">
                {user?.avatar || 'PT'}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-white truncate font-jakarta">
                  {user?.name || 'Pro Trader'}
                </span>
                <span className="text-[10px] text-[#38BDF8] font-semibold truncate font-mono">
                  {user?.plan || 'PRO ACCOUNT'}
                </span>
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
          </div>

          {/* Bottom Utility Icons */}
          <div className="flex items-center justify-between pt-2 border-t border-[#1E2638]/50 text-slate-400 text-xs px-1">
            <button 
              onClick={onToggleDarkMode}
              className="p-1.5 rounded-lg hover:text-white hover:bg-[#111726] transition flex items-center space-x-2 cursor-pointer"
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-sky-500" />}
              <span className="text-[11px] font-semibold text-slate-300">
                {darkMode ? 'Light Theme' : 'Dark Theme'}
              </span>
            </button>

            <button 
              className="p-1.5 rounded-lg hover:text-white hover:bg-[#111726] transition cursor-pointer"
              title="Help & Documentation"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {collapsed && (
        <div className="pb-4 flex flex-col items-center space-y-2">
          <button
            onClick={onToggleDarkMode}
            className="w-10 h-10 rounded-xl bg-[#111726] border border-[#1E2638] flex items-center justify-center text-slate-400 hover:text-white transition cursor-pointer"
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-sky-500" />}
          </button>
        </div>
      )}
    </aside>
  );
}
