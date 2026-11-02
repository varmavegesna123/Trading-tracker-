import React from 'react';
import { X, ExternalLink, Download, Image as ImageIcon } from 'lucide-react';
import { formatDate, formatCurrency, calculateTradePnL } from '../utils/formatters';

export function ChartLightboxModal({ isOpen, onClose, trade, currency = 'INR' }) {
  if (!isOpen || !trade || !trade.chartUrl) return null;

  const { pnlAmount } = calculateTradePnL(trade);
  const isWin = pnlAmount >= 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-lg overflow-y-auto">
      <div className="bg-slate-900 rounded-3xl max-w-5xl w-full border border-slate-800 shadow-2xl overflow-hidden transform transition-all text-white flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold font-jakarta text-white uppercase">
                  {trade.symbol}
                </h3>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  trade.direction === 'LONG' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                }`}>
                  {trade.direction}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {formatDate(trade.entryDate)}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Strategy: <span className="text-slate-200 font-semibold">{trade.strategy || 'N/A'}</span> • Outcome:{' '}
                <span className={`font-mono font-bold ${isWin ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {trade.status === 'CLOSED' ? formatCurrency(pnlAmount, currency) : 'OPEN'}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <a
              href={trade.chartUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Open full size in new tab"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Image Preview */}
        <div className="flex-1 bg-slate-950 p-4 flex items-center justify-center overflow-auto min-h-[350px]">
          <img
            src={trade.chartUrl}
            alt={`${trade.symbol} Chart`}
            className="max-h-[65vh] max-w-full object-contain rounded-xl shadow-2xl border border-slate-800"
          />
        </div>

        {/* Modal Footer: Trade Notes & Details */}
        {trade.notes && (
          <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/90 text-xs">
            <span className="font-semibold text-slate-400 block mb-1 uppercase text-[10px] tracking-wider">
              Setup Notes & Analysis:
            </span>
            <p className="text-slate-200 leading-relaxed whitespace-pre-wrap">
              {trade.notes}
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
