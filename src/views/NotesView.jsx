import React from 'react';
import { FileCode, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';

export function NotesView() {
  const rules = [
    { title: '1. Multi-Timeframe Confluence Rule', text: 'Never take an execution without verifying 1H Bias + 15m Structure + 5m POI + 1m BOS/CHoCH.' },
    { title: '2. Risk & Position Sizing Rule', text: 'Limit maximum risk per trade execution to 1% - 2% of total account capital.' },
    { title: '3. Liquidity Sweep Confirmation', text: 'Wait for Asian High/Low or Previous Day High/Low liquidity sweep before hunting entry POIs.' },
    { title: '4. Stop Loss Discipline', text: 'Place stop loss beyond the invalidation swing high/low. Never move stop loss wider during an open trade.' }
  ];

  return (
    <div className="space-y-6 pb-12 font-sans">
      <div className="flex items-center justify-between p-5 rounded-2xl bg-[#111726] border border-[#1E2638]">
        <div>
          <h2 className="text-xl font-extrabold text-[#38BDF8] font-jakarta">
            SMC Playbook & Trading Rules
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Personal rulebook, execution parameters, and Smart Money Concepts cheat sheet.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {rules.map((r, idx) => (
          <div key={idx} className="p-5 rounded-2xl bg-[#111726] border border-[#1E2638] space-y-2">
            <div className="flex items-center space-x-2 text-[#38BDF8] font-bold text-sm font-jakarta">
              <Zap className="w-4 h-4 fill-current" />
              <span>{r.title}</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">{r.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
