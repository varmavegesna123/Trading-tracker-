import React, { useState } from 'react';
import { X, ArrowDownRight, ArrowUpRight, DollarSign } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

export function CapitalModal({ isOpen, onClose, onSave, currency = 'INR' }) {
  const [formData, setFormData] = useState({
    type: 'DEPOSIT',
    amount: '',
    date: new Date().toISOString().slice(0, 16),
    notes: ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.amount || Number(formData.amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    onSave({
      id: `cap-${Date.now()}`,
      type: formData.type,
      amount: Number(formData.amount),
      date: formData.date,
      notes: formData.notes
    });

    setFormData({
      type: 'DEPOSIT',
      amount: '',
      date: new Date().toISOString().slice(0, 16),
      notes: ''
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden transform transition-all">
        
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white font-jakarta">
              Capital Transaction
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Record capital deposits or withdrawals
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Type Toggle */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Transaction Type
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, type: 'DEPOSIT' }))}
                className={`py-2 text-xs font-bold rounded-lg transition flex items-center justify-center space-x-1.5 ${
                  formData.type === 'DEPOSIT'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <ArrowDownRight className="w-4 h-4" />
                <span>Deposit Capital</span>
              </button>

              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, type: 'WITHDRAWAL' }))}
                className={`py-2 text-xs font-bold rounded-lg transition flex items-center justify-center space-x-1.5 ${
                  formData.type === 'WITHDRAWAL'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <ArrowUpRight className="w-4 h-4" />
                <span>Withdraw Capital</span>
              </button>
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Amount ({currency}) *
            </label>
            <input
              type="number"
              step="any"
              placeholder="e.g. 100000"
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-base font-bold font-mono rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Date & Time
            </label>
            <input
              type="datetime-local"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Notes / Reference
            </label>
            <input
              type="text"
              placeholder="e.g. Bank Transfer Ref, Profit Payout"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow-md shadow-indigo-500/20"
            >
              Submit Transaction
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
