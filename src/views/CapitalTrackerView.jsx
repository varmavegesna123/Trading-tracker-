import React, { useMemo } from 'react';
import { Wallet, ArrowDownRight, ArrowUpRight, Lock, DollarSign, Plus } from 'lucide-react';
import { formatCurrency, formatDate, calculateTradePnL } from '../utils/formatters';

export function CapitalTrackerView({ 
  trades = [], 
  capitalLogs = [], 
  currency = 'INR', 
  onOpenCapitalModal 
}) {
  const metrics = useMemo(() => {
    let totalDeposits = capitalLogs.filter(c => c.type === 'DEPOSIT').reduce((acc, c) => acc + (Number(c.amount) || 0), 0);
    let totalWithdrawals = capitalLogs.filter(c => c.type === 'WITHDRAWAL').reduce((acc, c) => acc + (Number(c.amount) || 0), 0);
    const netCapital = totalDeposits - totalWithdrawals;

    // Realized Net P&L from closed trades
    let netPnL = 0;
    trades.filter(t => t.status === 'CLOSED').forEach(t => {
      netPnL += calculateTradePnL(t).pnlAmount;
    });

    const totalEquity = netCapital + netPnL;

    // Capital currently tied up in open positions
    let allocatedCapital = 0;
    trades.filter(t => t.status === 'OPEN').forEach(t => {
      allocatedCapital += (Number(t.entryPrice) || 0) * (Number(t.quantity) || 0);
    });

    const availableCash = totalEquity - allocatedCapital;
    const allocationPercent = totalEquity > 0 ? (allocatedCapital / totalEquity) * 100 : 0;

    return {
      totalDeposits,
      totalWithdrawals,
      netCapital,
      netPnL,
      totalEquity,
      allocatedCapital,
      availableCash,
      allocationPercent
    };
  }, [trades, capitalLogs]);

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Header Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white font-jakarta">
            Capital Management & Cash Liquidity
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track account funding, active margin allocation, and unallocated cash balance.
          </p>
        </div>

        <button
          onClick={onOpenCapitalModal}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-xs rounded-xl shadow-md shadow-indigo-500/20 transition flex items-center space-x-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Deposit / Withdraw</span>
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Equity */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
            Account Equity
          </span>
          <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">
            {formatCurrency(metrics.totalEquity, currency)}
          </h3>
          <span className="text-[11px] text-slate-400 mt-2 block">
            Net Injected: {formatCurrency(metrics.netCapital, currency)}
          </span>
        </div>

        {/* Available Free Cash */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
            Available Free Cash
          </span>
          <h3 className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
            {formatCurrency(metrics.availableCash, currency)}
          </h3>
          <span className="text-[11px] text-slate-400 mt-2 block">
            {(100 - metrics.allocationPercent).toFixed(1)}% of portfolio liquid
          </span>
        </div>

        {/* Locked in Open Trades */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
            Capital in Active Trades
          </span>
          <h3 className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 font-mono">
            {formatCurrency(metrics.allocatedCapital, currency)}
          </h3>
          <span className="text-[11px] text-slate-400 mt-2 block">
            {metrics.allocationPercent.toFixed(1)}% margin utilization
          </span>
        </div>

        {/* Realized Profits */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
            Cumulative Realized P&L
          </span>
          <h3 className={`text-2xl font-extrabold font-mono ${
            metrics.netPnL >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
          }`}>
            {formatCurrency(metrics.netPnL, currency)}
          </h3>
          <span className="text-[11px] text-slate-400 mt-2 block">
            From trading activity
          </span>
        </div>

      </div>

      {/* Allocation Progress Bar */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
          <span>Capital Allocation Breakdown</span>
          <span className="font-mono">{metrics.allocationPercent.toFixed(1)}% Allocated</span>
        </div>
        
        <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
          <div 
            style={{ width: `${Math.min(metrics.allocationPercent, 100)}%` }} 
            className="bg-indigo-600 transition-all duration-500 h-full"
            title="Capital locked in open trades"
          />
          <div 
            style={{ width: `${Math.max(100 - metrics.allocationPercent, 0)}%` }} 
            className="bg-emerald-500 transition-all duration-500 h-full"
            title="Available cash balance"
          />
        </div>

        <div className="mt-3 flex items-center space-x-6 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-indigo-600" />
            <span className="text-slate-600 dark:text-slate-400">Open Positions ({formatCurrency(metrics.allocatedCapital, currency)})</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-slate-600 dark:text-slate-400">Free Liquid Cash ({formatCurrency(metrics.availableCash, currency)})</span>
          </div>
        </div>
      </div>

      {/* Capital Logs History Table */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-jakarta">
              Capital Transaction History
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Audit log of deposits and withdrawals
            </p>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          {capitalLogs.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase border-b border-slate-100 dark:border-slate-800">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3 text-right">Amount ({currency})</th>
                  <th className="py-2.5 px-3">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {capitalLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-3 font-mono text-slate-500 dark:text-slate-400">
                      {formatDate(log.date)}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        log.type === 'DEPOSIT'
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                          : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400'
                      }`}>
                        {log.type === 'DEPOSIT' ? <ArrowDownRight className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                        <span>{log.type}</span>
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                      {formatCurrency(log.amount, currency)}
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                      {log.notes || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="py-8 text-center text-slate-400 text-xs">
              No capital transactions recorded yet.
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
