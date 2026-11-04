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
  ChevronRight,
  Mail,
  LogOut,
  ShieldCheck
} from 'lucide-react';

export function Sidebar({ 
  currentTab, 
  setCurrentTab, 
  user, 
  onOpenAuthModal,
  onLogout,
  collapsed,
  setCollapsed,
  darkMode = true,
  onToggleDarkMode
}) {
  const displayName = user?.full_name || user?.name || (user?.email ? user.email.split('@')[0] : 'Pro Trader');
  const displayEmail = user?.email || 'varmavegesna093@gmail.com';

  const initials = (() => {
    if (user?.full_name) {
      const parts = user.full_name.trim().split(/\s+/);
      if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      return parts[0].slice(0, 2).toUpperCase();
    }
    if (user?.name) {
      const parts = user.name.trim().split(/\s+/);
      if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      return parts[0].slice(0, 2).toUpperCase();
    }
    if (user?.email) {
      return user.email.slice(0, 2).toUpperCase();
    }
    return 'PT';
  })();
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
          {/* Redesigned Pro Trader User Profile Card (Light & Dark Mode Compatible) */}
          <div className="rounded-2xl bg-slate-50 dark:bg-gradient-to-b dark:from-[#111726] dark:to-[#0B0F19] border border-slate-200 dark:border-[#1E2638] hover:border-sky-500/40 p-3 shadow-sm dark:shadow-lg dark:shadow-black/20 transition-all space-y-2.5">
            {/* Top row: Avatar, Name, Email, Status */}
            <div 
              onClick={onOpenAuthModal}
              className="flex items-center space-x-3 cursor-pointer group"
              title="Click to manage account profile"
            >
              {/* Dynamic Avatar with Active Indicator */}
              <div className="relative shrink-0">
                <div className="w-10 h-10 rounded-xl bg-sky-500/10 dark:bg-gradient-to-tr dark:from-[#38BDF8]/20 dark:via-sky-600/30 dark:to-indigo-600/30 border border-sky-500/30 dark:border-[#38BDF8]/40 text-sky-600 dark:text-[#38BDF8] font-bold text-xs flex items-center justify-center font-mono shadow-inner group-hover:scale-105 group-hover:border-[#38BDF8] transition">
                  {initials}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#0B0F19]" title="Active Session" />
              </div>

              {/* Name & Login Email */}
              <div className="flex flex-col min-w-0 flex-1">
                <div className="flex items-center space-x-1.5">
                  <span className="text-xs font-bold text-slate-800 dark:text-white truncate font-jakarta group-hover:text-sky-600 dark:group-hover:text-[#38BDF8] transition">
                    {displayName}
                  </span>
                  <ShieldCheck className="w-3.5 h-3.5 text-sky-500 dark:text-[#38BDF8] shrink-0" title="Verified Trader" />
                </div>
                
                {/* Prominently visible login email */}
                <div className="flex items-center space-x-1 text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition">
                  <Mail className="w-3 h-3 text-slate-400 dark:text-slate-500 shrink-0" />
                  <span className="text-[11px] font-mono text-slate-600 dark:text-slate-300 truncate" title={displayEmail}>
                    {displayEmail}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom row: Pro Plan Active Pill & Quick Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-[#1E2638]/60">
              <div className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 font-mono tracking-wider">
                <Crown className="w-3 h-3 text-amber-500 dark:text-amber-400" />
                <span>{user?.plan || 'PREMIUM PLAN'}</span>
              </div>

              <div className="flex items-center space-x-1">
                <button
                  type="button"
                  onClick={onOpenAuthModal}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-[#1E2638] transition"
                  title="Switch / Manage Account"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
                {onLogout && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onLogout();
                    }}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition"
                    title="Sign Out"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
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
        <div className="pb-4 flex flex-col items-center space-y-3">
          {/* Collapsed User Avatar */}
          <button
            onClick={onOpenAuthModal}
            className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-[#38BDF8]/20 via-sky-600/30 to-indigo-600/30 border border-[#38BDF8]/40 text-[#38BDF8] font-bold text-xs flex items-center justify-center font-mono hover:scale-105 transition"
            title={`${displayName} (${displayEmail})`}
          >
            {initials}
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#0B0F19]" />
          </button>

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
