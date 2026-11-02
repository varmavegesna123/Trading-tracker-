import React, { useState } from 'react';
import { X, Upload, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { storageService } from '../services/storage';

export function CSVImportModal({ isOpen, onClose, onImportSuccess }) {
  const [csvContent, setCsvContent] = useState('');
  const [error, setError] = useState('');
  const [previewTrades, setPreviewTrades] = useState([]);

  if (!isOpen) return null;

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      setCsvContent(text);
      const parsed = storageService.parseTradesCSV(text);
      if (!parsed.length) {
        setError('No valid trade rows detected in CSV. Please verify column headers: Symbol, Entry, Exit, Quantity, Date.');
        setPreviewTrades([]);
      } else {
        setError('');
        setPreviewTrades(parsed);
      }
    };
    reader.readAsText(file);
  };

  const handleConfirmImport = () => {
    if (!previewTrades.length) return;
    onImportSuccess(previewTrades);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 rounded-2xl max-w-xl w-full border border-slate-800 shadow-2xl overflow-hidden transform transition-all text-white">
        
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold font-jakarta text-white">
                Import Real Trades (CSV)
              </h2>
              <p className="text-xs text-slate-400">
                Upload your broker export or spreadsheet to import trades.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          
          {/* File Input Box */}
          <div className="border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-2xl p-6 text-center bg-slate-850 transition">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
              id="csv-file-input"
            />
            <label htmlFor="csv-file-input" className="cursor-pointer flex flex-col items-center">
              <FileText className="w-10 h-10 text-indigo-400 mb-2 opacity-80" />
              <span className="text-sm font-semibold text-slate-200">
                Click to browse or drag CSV file here
              </span>
              <span className="text-xs text-slate-400 mt-1">
                Expected headers: Symbol, Direction, Entry Price, Exit Price, Quantity, Date
              </span>
            </label>
          </div>

          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Preview Table */}
          {previewTrades.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                <span>Preview Parsed Trades ({previewTrades.length})</span>
                <span className="text-emerald-400 flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Ready to import</span>
                </span>
              </div>

              <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950 p-2">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-slate-500 border-b border-slate-800">
                      <th className="p-1.5">Symbol</th>
                      <th className="p-1.5">Dir</th>
                      <th className="p-1.5">Entry</th>
                      <th className="p-1.5">Exit</th>
                      <th className="p-1.5 text-right">Qty</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900 text-slate-300">
                    {previewTrades.map((t, idx) => (
                      <tr key={idx}>
                        <td className="p-1.5 font-bold font-jakarta">{t.symbol}</td>
                        <td className="p-1.5">{t.direction}</td>
                        <td className="p-1.5 font-mono">{t.entryPrice}</td>
                        <td className="p-1.5 font-mono">{t.exitPrice || '-'}</td>
                        <td className="p-1.5 text-right font-mono">{t.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="pt-2 flex justify-end space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl transition"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmImport}
              disabled={!previewTrades.length}
              className="px-5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl transition shadow-md shadow-indigo-500/20"
            >
              Import {previewTrades.length} Trades
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
