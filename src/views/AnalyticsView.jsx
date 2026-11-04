import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  PieChart as PieIcon, 
  Trophy, 
  Flame, 
  Award,
  Zap,
  CheckCircle2,
  TrendingUp,
  Activity,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  CartesianGrid 
} from 'recharts';
import { formatCurrency, formatDate, calculateTradePnL } from '../utils/formatters';

const PIE_COLORS = ['#10B981', '#EF4444', '#475569'];

export function AnalyticsView({ trades = [], currency = 'INR' }) {
  const [activeTab, setActiveTab] = useState('overview');

  const analytics = useMemo(() => {
    const closed = trades.filter(t => t.status === 'CLOSED');

    let winCount = 0;
    let lossCount = 0;
    let breakevenCount = 0;
    let totalWinAmount = 0;
    let totalLossAmount = 0;

    let bestTrade = null;
    let worstTrade = null;

    const strategyStats = {};
    const monthlyStats = {};
    const confluenceStats = {
      4: { count: 0, wins: 0, pnl: 0 },
      3: { count: 0, wins: 0, pnl: 0 },
      2: { count: 0, wins: 0, pnl: 0 },
      1: { count: 0, wins: 0, pnl: 0 },
      0: { count: 0, wins: 0, pnl: 0 }
    };

    closed.forEach(t => {
      const { pnlAmount } = calculateTradePnL(t);
      
      if (pnlAmount > 0) {
        if (!bestTrade || pnlAmount > calculateTradePnL(bestTrade).pnlAmount) {
          bestTrade = t;
        }
      } else if (pnlAmount < 0) {
        if (!worstTrade || pnlAmount < calculateTradePnL(worstTrade).pnlAmount) {
          worstTrade = t;
        }
      }

      if (pnlAmount > 0) {
        winCount += 1;
        totalWinAmount += pnlAmount;
      } else if (pnlAmount < 0) {
        lossCount += 1;
        totalLossAmount += Math.abs(pnlAmount);
      } else {
        breakevenCount += 1;
      }

      const confScore = [t.h1Bias, t.m15Structure, t.m5EntryPoi, t.m1BosChoch].filter(Boolean).length;
      if (confluenceStats[confScore]) {
        confluenceStats[confScore].count += 1;
        confluenceStats[confScore].pnl += pnlAmount;
        if (pnlAmount >= 0) confluenceStats[confScore].wins += 1;
      }

      const strat = t.strategy || 'General Model';
      if (!strategyStats[strat]) {
        strategyStats[strat] = { count: 0, wins: 0, losses: 0, pnl: 0, winAmt: 0, lossAmt: 0 };
      }
      strategyStats[strat].count += 1;
      strategyStats[strat].pnl += pnlAmount;
      if (pnlAmount > 0) {
        strategyStats[strat].wins += 1;
        strategyStats[strat].winAmt += pnlAmount;
      } else if (pnlAmount < 0) {
        strategyStats[strat].losses += 1;
        strategyStats[strat].lossAmt += Math.abs(pnlAmount);
      }

      if (t.exitDate && typeof t.exitDate === 'string') {
        const monthKey = t.exitDate.slice(0, 7);
        if (!monthlyStats[monthKey]) {
          monthlyStats[monthKey] = { pnl: 0, trades: 0, wins: 0 };
        }
        monthlyStats[monthKey].pnl += pnlAmount;
        monthlyStats[monthKey].trades += 1;
        if (pnlAmount > 0) monthlyStats[monthKey].wins += 1;
      }
    });

    const totalClosed = closed.length;
    const avgWin = winCount > 0 ? totalWinAmount / winCount : 0;
    const avgLoss = lossCount > 0 ? totalLossAmount / lossCount : 0;
    const payoffRatio = avgLoss > 0 ? (avgWin / avgLoss) : avgWin > 0 ? avgWin : 0;
    const winRate = totalClosed > 0 ? (winCount / totalClosed) * 100 : 0;
    const expectancy = totalClosed > 0 ? (totalWinAmount - totalLossAmount) / totalClosed : 0;
    const profitFactor = totalLossAmount > 0 ? (totalWinAmount / totalLossAmount) : totalWinAmount > 0 ? totalWinAmount : 0;

    const monthlyChartData = Object.keys(monthlyStats).sort().map(mKey => {
      const [year, month] = mKey.split('-');
      const dateObj = new Date(year, parseInt(month) - 1, 1);
      const monthName = dateObj.toLocaleString('en-US', { month: 'short', year: '2-digit' });
      return {
        month: monthName,
        pnl: monthlyStats[mKey].pnl,
        trades: monthlyStats[mKey].trades,
        winRate: (monthlyStats[mKey].wins / monthlyStats[mKey].trades) * 100
      };
    });

    const strategyList = Object.keys(strategyStats).map(name => {
      const s = strategyStats[name];
      const sWinRate = s.count > 0 ? (s.wins / s.count) * 100 : 0;
      const sPF = s.lossAmt > 0 ? s.winAmt / s.lossAmt : s.winAmt > 0 ? s.winAmt : 0;
      const sExp = s.count > 0 ? s.pnl / s.count : 0;
      return {
        name,
        count: s.count,
        wins: s.wins,
        losses: s.losses,
        winRate: sWinRate,
        netPnL: s.pnl,
        pf: sPF,
        expectancy: sExp
      };
    }).sort((a, b) => b.netPnL - a.netPnL);

    return {
      totalClosed,
      winCount,
      lossCount,
      breakevenCount,
      winRate,
      avgWin,
      avgLoss,
      payoffRatio,
      expectancy,
      profitFactor,
      bestTrade,
      worstTrade,
      monthlyChartData,
      confluenceStats,
      strategyList
    };
  }, [trades]);

  const aPlusWinRate = analytics.confluenceStats[4].count > 0 
    ? (analytics.confluenceStats[4].wins / analytics.confluenceStats[4].count) * 100 
    : 0;

  const bWinRate = analytics.confluenceStats[3].count > 0 
    ? (analytics.confluenceStats[3].wins / analytics.confluenceStats[3].count) * 100 
    : 0;

  const lowCount = analytics.confluenceStats[0].count + analytics.confluenceStats[1].count + analytics.confluenceStats[2].count;
  const lowWins = analytics.confluenceStats[0].wins + analytics.confluenceStats[1].wins + analytics.confluenceStats[2].wins;
  const lowPnl = analytics.confluenceStats[0].pnl + analytics.confluenceStats[1].pnl + analytics.confluenceStats[2].pnl;
  const lowWinRate = lowCount > 0 ? (lowWins / lowCount) * 100 : 0;

  return (
    <div className="space-y-6 pb-12 font-sans">
      
      {/* Top Header & Sub-Tab Navigation Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl glass-box">
        <div>
          <h2 className="text-xl font-extrabold text-[#38BDF8] font-jakarta tracking-tight">
            Performance Analytics & Edge Matrix
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Deep quantitative metrics, confluence win rates, and trade expectancy breakdown.
          </p>
        </div>

        {/* Sub-Tabs */}
        <div className="p-1 bg-[#0B0F19] rounded-xl border border-[#1E2638] flex space-x-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-1.5 text-xs font-extrabold rounded-lg transition font-jakarta ${
              activeTab === 'overview'
                ? 'bg-[#38BDF8] text-white shadow-md shadow-sky-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Overview & Edge
          </button>

          <button
            onClick={() => setActiveTab('monthly')}
            className={`px-3.5 py-1.5 text-xs font-extrabold rounded-lg transition font-jakarta ${
              activeTab === 'monthly'
                ? 'bg-[#38BDF8] text-white shadow-md shadow-sky-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Monthly Performance
          </button>

          <button
            onClick={() => setActiveTab('strategies')}
            className={`px-3.5 py-1.5 text-xs font-extrabold rounded-lg transition font-jakarta ${
              activeTab === 'strategies'
                ? 'bg-[#38BDF8] text-white shadow-md shadow-sky-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Strategies Matrix
          </button>
        </div>
      </div>

      {/* Spotlight Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-5 rounded-2xl glass-box space-y-1">
          <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">
            Overall Win Rate %
          </span>
          <h3 className="text-lg font-bold text-white font-mono">
            {analytics.winRate.toFixed(1)}%
          </h3>
          <span className="text-[11px] text-slate-400 block pt-1">
            {analytics.winCount} Wins / {analytics.lossCount} Losses
          </span>
        </div>

        <div className="p-5 rounded-2xl glass-box space-y-1">
          <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">
            Avg Win / Avg Loss
          </span>
          <h3 className="text-lg font-bold text-[#38BDF8] font-mono">
            {analytics.payoffRatio.toFixed(2)}:1
          </h3>
          <span className="text-[11px] text-slate-400 block pt-1">
            Avg Win: {formatCurrency(analytics.avgWin, currency)}
          </span>
        </div>

        <div className="p-5 rounded-2xl glass-box space-y-1">
          <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">
            Trade Expectancy
          </span>
          <h3 className={`text-lg font-bold font-mono ${
            analytics.expectancy >= 0 ? 'text-[#10B981]' : 'text-rose-400'
          }`}>
            {formatCurrency(analytics.expectancy, currency)}
          </h3>
          <span className="text-[11px] text-slate-400 block pt-1">
            Expected profit per trade execution
          </span>
        </div>

        <div className="p-5 rounded-2xl glass-box space-y-1">
          <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">
            Profit Factor
          </span>
          <h3 className="text-lg font-bold text-white font-mono">
            {analytics.profitFactor.toFixed(2)}
          </h3>
          <span className="text-[11px] text-slate-400 block pt-1">
            Gross Win vs Loss Ratio
          </span>
        </div>

      </div>

      {/* OVERVIEW & EDGE TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          
          {/* ULTRA-PREMIUM SMC EDGE MATRIX */}
          <div className="p-6 rounded-2xl glass-box space-y-5">
            <div className="flex items-center justify-between border-b border-[#1E2638] pb-4">
              <div>
                <h3 className="text-base font-extrabold text-white font-jakarta flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-[#38BDF8] fill-current" />
                  <span>Edge Matrix: Win Rate by Multi-Timeframe Confluences</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Comparative analysis of A+ 4/4 confluences (1H Bias + 15m Structure + 5m POI + 1m BOS/CHoCH) vs lower setups
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-[#38BDF8]/10 border border-[#38BDF8]/30 text-[#38BDF8] text-xs font-mono font-bold">
                SMC VERIFIED
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              
              {/* A+ Setup (4/4) */}
              <div className="p-5 rounded-2xl glass-box-emerald space-y-3 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#10B981] uppercase tracking-wider font-jakarta">
                    ⭐⭐⭐⭐ A+ SETUP (4/4)
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#10B981]/20 text-[#10B981] text-[10px] font-bold font-mono">
                    HIGH PROBABILITY
                  </span>
                </div>

                <div className="flex items-baseline justify-between pt-1">
                  <span className="text-xl font-bold font-mono text-[#10B981]">
                    {aPlusWinRate.toFixed(1)}%
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-300">
                    {formatCurrency(analytics.confluenceStats[4].pnl, currency)}
                  </span>
                </div>

                <div className="w-full h-2 bg-[#0B0F19] rounded-full overflow-hidden">
                  <div style={{ width: `${aPlusWinRate}%` }} className="bg-[#10B981] h-full rounded-full" />
                </div>

                <span className="text-[11px] text-slate-400 block pt-1 border-t border-[#1E2638]">
                  {analytics.confluenceStats[4].wins} Wins out of {analytics.confluenceStats[4].count} trades
                </span>
              </div>

              {/* B Setup (3/4) */}
              <div className="p-5 rounded-2xl glass-box space-y-3 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#38BDF8] uppercase tracking-wider font-jakarta">
                    ⭐⭐⭐ B SETUP (3/4)
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#38BDF8]/20 text-[#38BDF8] text-[10px] font-bold font-mono">
                    MODERATE
                  </span>
                </div>

                <div className="flex items-baseline justify-between pt-1">
                  <span className="text-xl font-bold font-mono text-[#38BDF8]">
                    {bWinRate.toFixed(1)}%
                  </span>
                  <span className="text-xs font-mono font-bold text-sky-300">
                    {formatCurrency(analytics.confluenceStats[3].pnl, currency)}
                  </span>
                </div>

                <div className="w-full h-2 bg-[#0B0F19] rounded-full overflow-hidden">
                  <div style={{ width: `${bWinRate}%` }} className="bg-[#38BDF8] h-full rounded-full" />
                </div>

                <span className="text-[11px] text-slate-400 block pt-1 border-t border-[#1E2638]">
                  {analytics.confluenceStats[3].wins} Wins out of {analytics.confluenceStats[3].count} trades
                </span>
              </div>

              {/* Low Confluence (<2/4) */}
              <div className="p-5 rounded-2xl glass-box-rose space-y-3 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-rose-400 uppercase tracking-wider font-jakarta">
                    STANDARD SETUP (&lt;2/4)
                  </span>
                  <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 text-[10px] font-bold font-mono">
                    STANDARD RISK
                  </span>
                </div>

                <div className="flex items-baseline justify-between pt-1">
                  <span className="text-xl font-bold font-mono text-rose-400">
                    {lowWinRate.toFixed(1)}%
                  </span>
                  <span className="text-xs font-mono font-bold text-rose-400">
                    {formatCurrency(lowPnl, currency)}
                  </span>
                </div>

                <div className="w-full h-2 bg-[#0B0F19] rounded-full overflow-hidden">
                  <div style={{ width: `${lowWinRate}%` }} className="bg-rose-500 h-full rounded-full" />
                </div>

                <span className="text-[11px] text-slate-400 block pt-1 border-t border-[#1E2638]">
                  {lowWins} Wins out of {lowCount} trades
                </span>
              </div>

            </div>
          </div>

          {/* BEST & WORST EXECUTION SPOTLIGHT CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Best Trade Spotlight */}
            <div className="p-5 rounded-2xl glass-box-emerald space-y-3">
              <div className="flex items-center justify-between border-b border-[#1E2638] pb-3">
                <div className="flex items-center space-x-2">
                  <Trophy className="w-4 h-4 text-[#10B981]" />
                  <h3 className="text-sm font-bold text-white font-jakarta">Best Execution Record</h3>
                </div>
                <span className="px-2 py-0.5 rounded bg-[#10B981]/10 text-[#10B981] text-[10px] font-bold font-mono">
                  TOP PROFIT
                </span>
              </div>

              {analytics.bestTrade ? (
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-sans">Symbol:</span>
                    <span className="font-bold text-white">{analytics.bestTrade.symbol}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-sans">Direction:</span>
                    <span className="text-[#10B981] font-bold">{analytics.bestTrade.direction}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-sans">Realized P&L:</span>
                    <span className="text-lg font-extrabold text-[#10B981]">
                      +{formatCurrency(calculateTradePnL(analytics.bestTrade).pnlAmount, currency)}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="py-4 text-center text-xs text-slate-500">No closed trades recorded yet</div>
              )}
            </div>

            {/* Worst Trade Spotlight */}
            <div className="p-5 rounded-2xl glass-box-rose space-y-3">
              <div className="flex items-center justify-between border-b border-[#1E2638] pb-3">
                <div className="flex items-center space-x-2">
                  <ArrowDownRight className="w-4 h-4 text-rose-400" />
                  <h3 className="text-sm font-bold text-white font-jakarta">Max Loss Record</h3>
                </div>
                <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 text-[10px] font-bold font-mono">
                  {analytics.worstTrade ? 'MAX DRAWDOWN' : '0 LOSSES'}
                </span>
              </div>

              {analytics.worstTrade ? (
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-sans">Symbol:</span>
                    <span className="font-bold text-white">{analytics.worstTrade.symbol}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-sans">Direction:</span>
                    <span className="text-rose-400 font-bold">{analytics.worstTrade.direction}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-sans">Realized P&L:</span>
                    <span className="text-lg font-extrabold text-rose-400">
                      {formatCurrency(calculateTradePnL(analytics.worstTrade).pnlAmount, currency)}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="py-4 text-center text-xs text-slate-400 font-mono">
                  No loss executions recorded (0 Drawdown)
                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {/* MONTHLY PERFORMANCE TAB */}
      {activeTab === 'monthly' && (
        <div className="p-6 rounded-2xl glass-box space-y-4">
          <div className="border-b border-[#1E2638] pb-3">
            <h3 className="text-sm font-bold text-white font-jakarta">
              Monthly P&L Visualizer
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Net realized profit and loss breakdown per calendar month.
            </p>
          </div>

          <div className="h-64 w-full pt-2">
            {analytics.monthlyChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.monthlyChartData} margin={{ top: 10, right: 30, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1E2638" opacity={0.6} />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748B' }} axisLine={false} tickLine={false} padding={{ left: 40, right: 40 }} />
                  <YAxis tick={{ fontSize: 10, fill: '#64748B' }} axisLine={false} tickLine={false} tickFormatter={(v) => formatCurrency(v, currency, 'INR', { notation: 'compact' })} />
                  <Tooltip
                    shared={false}
                    isAnimationActive={false}
                    cursor={{ fill: 'transparent' }}
                    wrapperStyle={{ outline: 'none', pointerEvents: 'none', transition: 'transform 75ms ease-out' }}
                    contentStyle={{
                      backgroundColor: '#0B0F19',
                      borderColor: '#1E2638',
                      borderRadius: '12px',
                      color: '#ffffff',
                      fontSize: '11px',
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
                    }}
                    itemStyle={{ color: '#ffffff' }}
                    labelStyle={{ color: '#ffffff', fontWeight: 'bold' }}
                    formatter={(v) => [<span key="pnl" style={{ color: '#ffffff', fontWeight: 'bold' }}>{formatCurrency(v, currency)}</span>, 'Monthly P&L']}
                  />
                  <Bar dataKey="pnl" maxBarSize={36} radius={[6, 6, 0, 0]} isAnimationActive={false}>
                    {analytics.monthlyChartData.map((entry, idx) => (
                      <Cell 
                        key={idx} 
                        fill={entry.pnl >= 0 ? '#10B981' : '#EF4444'} 
                        className="transition-all duration-150 cursor-pointer hover:opacity-85"
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                Monthly performance data will render as trades are closed
              </div>
            )}
          </div>
        </div>
      )}

      {/* STRATEGIES TAB */}
      {activeTab === 'strategies' && (
        <div className="p-6 rounded-2xl glass-box space-y-4">
          <div className="border-b border-[#1E2638] pb-3">
            <h3 className="text-sm font-bold text-white font-jakarta">
              Strategy Models Matrix
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Performance metrics grouped by SMC, Price Action, and Mechanical strategies.
            </p>
          </div>

          <div className="overflow-x-auto">
            {analytics.strategyList.length > 0 ? (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="text-[10px] font-bold text-slate-500 uppercase border-b border-[#1E2638]">
                    <th className="py-2.5 px-3">STRATEGY MODEL</th>
                    <th className="py-2.5 px-3">EXECUTIONS</th>
                    <th className="py-2.5 px-3">WIN RATE</th>
                    <th className="py-2.5 px-3">NET P&L</th>
                    <th className="py-2.5 px-3">PROFIT FACTOR</th>
                    <th className="py-2.5 px-3 text-right">EXPECTANCY</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E2638]/50">
                  {analytics.strategyList.map((s, idx) => (
                    <tr key={idx} className="hover:bg-[#0B0F19]/50 transition">
                      <td className="py-3 px-3 font-bold text-white font-jakarta">{s.name}</td>
                      <td className="py-3 px-3 font-mono text-slate-300">{s.count}</td>
                      <td className="py-3 px-3 font-mono text-slate-300">{s.winRate.toFixed(1)}%</td>
                      <td className={`py-3 px-3 font-mono font-bold ${s.netPnL >= 0 ? 'text-[#10B981]' : 'text-rose-400'}`}>
                        {s.netPnL >= 0 ? '+' : ''}{formatCurrency(s.netPnL, currency)}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-300">{s.pf.toFixed(2)}</td>
                      <td className={`py-3 px-3 text-right font-mono font-bold ${s.expectancy >= 0 ? 'text-[#10B981]' : 'text-rose-400'}`}>
                        {s.expectancy >= 0 ? '+' : ''}{formatCurrency(s.expectancy, currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="py-6 text-center text-xs text-slate-500">
                No strategy model executions logged yet
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
