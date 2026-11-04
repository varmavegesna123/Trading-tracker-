import React, { useState, useEffect } from 'react';
import { Target, Trophy, Award, CheckCircle2, Edit3, X, Save } from 'lucide-react';
import { formatCurrency, convertCurrency, calculateTradePnL } from '../utils/formatters';

export function GoalsView({ trades = [], currency = 'INR', user }) {
  const storagePrefix = `tradetracker_${user?.id || user?.email || 'anonymous'}`;
  // Saved Goals State with LocalStorage Persistence
  const [profitGoal, setProfitGoal] = useState(() => {
    try {
      const saved = user ? localStorage.getItem(`${storagePrefix}_profit_goal_v1`) : null;
      return saved ? parseFloat(saved) : 50000;
    } catch (e) { return 50000; }
  });

  const [tradeGoal, setTradeGoal] = useState(() => {
    try {
      const saved = user ? localStorage.getItem(`${storagePrefix}_trade_goal_v1`) : null;
      return saved ? parseInt(saved) : 50;
    } catch (e) { return 50; }
  });

  const [winRateGoal, setWinRateGoal] = useState(() => {
    try {
      const saved = user ? localStorage.getItem(`${storagePrefix}_winrate_goal_v1`) : null;
      return saved ? parseFloat(saved) : 60;
    } catch (e) { return 60; }
  });

  // Edit Modal State
  const [isEditing, setIsEditing] = useState(false);
  const [tempProfitGoal, setTempProfitGoal] = useState(() => convertCurrency(profitGoal, 'INR', currency));
  const [tempTradeGoal, setTempTradeGoal] = useState(tradeGoal);
  const [tempWinRateGoal, setTempWinRateGoal] = useState(winRateGoal);

  const handleOpenEdit = () => {
    setTempProfitGoal(Math.round(convertCurrency(profitGoal, 'INR', currency)));
    setTempTradeGoal(tradeGoal);
    setTempWinRateGoal(winRateGoal);
    setIsEditing(true);
  };

  const handleSaveGoals = (e) => {
    e.preventDefault();
    const enteredProfit = parseFloat(tempProfitGoal) || 1000;
    const pGoal = convertCurrency(enteredProfit, currency, 'INR');
    const tGoal = parseInt(tempTradeGoal) || 10;
    const wGoal = Math.min(Math.max(parseFloat(tempWinRateGoal) || 50, 1), 100);

    setProfitGoal(pGoal);
    setTradeGoal(tGoal);
    setWinRateGoal(wGoal);

    localStorage.setItem(`${storagePrefix}_profit_goal_v1`, pGoal.toString());
    localStorage.setItem(`${storagePrefix}_trade_goal_v1`, tGoal.toString());
    localStorage.setItem(`${storagePrefix}_winrate_goal_v1`, wGoal.toString());

    setIsEditing(false);
  };

  const closed = trades.filter(t => t.status === 'CLOSED');
  let currentPnL = 0;
  let winCount = 0;

  closed.forEach(t => {
    const { pnlAmount } = calculateTradePnL(t);
    currentPnL += pnlAmount;
    if (pnlAmount >= 0) winCount++;
  });

  const winRate = closed.length > 0 ? (winCount / closed.length) * 100 : 0;

  return (
    <div className="space-y-6 pb-12 font-sans">
      
      {/* Header Bar */}
      <div className="flex items-center justify-between p-5 rounded-2xl glass-box">
        <div>
          <h2 className="text-xl font-extrabold text-[#38BDF8] font-jakarta">
            Trading Goals & Target Milestones
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Track and edit your monthly profit targets, execution discipline, and win rate milestones.
          </p>
        </div>

        <button
          onClick={handleOpenEdit}
          className="px-4 py-2.5 bg-gradient-to-r from-[#38BDF8] to-[#0284C7] hover:from-[#0284C7] hover:to-[#0369A1] text-white font-extrabold text-xs rounded-xl shadow-md shadow-sky-500/20 transition flex items-center space-x-1.5"
        >
          <Edit3 className="w-4 h-4" />
          <span>Edit Goals & Targets</span>
        </button>
      </div>

      {/* Target Progress Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* 1. Monthly Profit Goal */}
        <div className="p-5 rounded-2xl glass-box space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-[#1E2638] pb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Monthly Profit Target</span>
            <Target className="w-4 h-4 text-[#38BDF8]" />
          </div>

          <div className="flex items-baseline justify-between pt-1">
            <h3 className="text-lg font-bold text-white font-mono">{formatCurrency(currentPnL, currency)}</h3>
            <span className="text-xs font-mono font-bold text-[#38BDF8]">
              Target: {formatCurrency(profitGoal, currency)}
            </span>
          </div>

          <div className="w-full h-2.5 bg-[#0B0F19] rounded-full overflow-hidden">
            <div 
              style={{ width: `${Math.min(Math.max((currentPnL / profitGoal) * 100, 0), 100)}%` }} 
              className="bg-[#38BDF8] h-full rounded-full transition-all duration-500" 
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
            <span>Progress: {((currentPnL / profitGoal) * 100).toFixed(1)}%</span>
            <span>Remaining: {formatCurrency(Math.max(profitGoal - currentPnL, 0), currency)}</span>
          </div>
        </div>

        {/* 2. Trade Execution Goal */}
        <div className="p-5 rounded-2xl glass-box-emerald space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-[#1E2638] pb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Execution Target</span>
            <Trophy className="w-4 h-4 text-[#10B981]" />
          </div>

          <div className="flex items-baseline justify-between pt-1">
            <h3 className="text-lg font-bold text-white font-mono">{closed.length} Trades</h3>
            <span className="text-xs font-mono font-bold text-[#10B981]">
              Target: {tradeGoal} Trades
            </span>
          </div>

          <div className="w-full h-2.5 bg-[#0B0F19] rounded-full overflow-hidden">
            <div 
              style={{ width: `${Math.min((closed.length / tradeGoal) * 100, 100)}%` }} 
              className="bg-[#10B981] h-full rounded-full transition-all duration-500" 
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
            <span>Progress: {((closed.length / tradeGoal) * 100).toFixed(1)}%</span>
            <span>Remaining: {Math.max(tradeGoal - closed.length, 0)} Trades</span>
          </div>
        </div>

        {/* 3. Win Rate Target */}
        <div className="p-5 rounded-2xl glass-box space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-[#1E2638] pb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Win Rate Target</span>
            <Award className="w-4 h-4 text-purple-400" />
          </div>

          <div className="flex items-baseline justify-between pt-1">
            <h3 className="text-lg font-bold text-white font-mono">{winRate.toFixed(1)}%</h3>
            <span className="text-xs font-mono font-bold text-purple-400">
              Target: {winRateGoal}%
            </span>
          </div>

          <div className="w-full h-2.5 bg-[#0B0F19] rounded-full overflow-hidden">
            <div 
              style={{ width: `${Math.min((winRate / winRateGoal) * 100, 100)}%` }} 
              className="bg-purple-500 h-full rounded-full transition-all duration-500" 
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
            <span>Actual: {winRate.toFixed(1)}%</span>
            <span>Target: {winRateGoal}%</span>
          </div>
        </div>

      </div>

      {/* EDIT GOALS DIALOG MODAL */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto font-sans">
          <div className="bg-[#0B0F19] rounded-3xl max-w-md w-full border border-[#1E2638] shadow-2xl overflow-hidden text-slate-100 p-6 space-y-6">
            
            <div className="flex items-center justify-between border-b border-[#1E2638] pb-3">
              <h3 className="text-lg font-extrabold text-[#38BDF8] font-jakarta">
                Edit Goals & Milestones
              </h3>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="p-2 rounded-xl bg-[#111726] border border-[#1E2638] text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveGoals} className="space-y-4">
              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#38BDF8] mb-1">
                  Monthly Profit Target ({currency})
                </label>
                <input
                  type="number"
                  step="any"
                  value={tempProfitGoal}
                  onChange={(e) => setTempProfitGoal(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#111726] text-white text-xs rounded-xl border border-[#1E2638] font-mono font-bold focus:outline-none focus:border-[#38BDF8]"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#38BDF8] mb-1">
                  Target Number of Trades (Execution Goal)
                </label>
                <input
                  type="number"
                  value={tempTradeGoal}
                  onChange={(e) => setTempTradeGoal(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#111726] text-white text-xs rounded-xl border border-[#1E2638] font-mono font-bold focus:outline-none focus:border-[#38BDF8]"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#38BDF8] mb-1">
                  Target Win Rate % (1% - 100%)
                </label>
                <input
                  type="number"
                  step="any"
                  max="100"
                  min="1"
                  value={tempWinRateGoal}
                  onChange={(e) => setTempWinRateGoal(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#111726] text-white text-xs rounded-xl border border-[#1E2638] font-mono font-bold focus:outline-none focus:border-[#38BDF8]"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-[#1E2638]">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-5 py-2 bg-[#111726] border border-[#1E2638] text-slate-400 font-bold text-xs rounded-xl hover:text-white"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-[#38BDF8] to-[#0284C7] hover:from-[#0284C7] hover:to-[#0369A1] text-white font-extrabold text-xs rounded-xl shadow-lg shadow-sky-500/20 transition flex items-center space-x-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Targets</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
