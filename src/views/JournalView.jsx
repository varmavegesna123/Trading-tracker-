import React, { useState } from 'react';
import { 
  BookOpen, 
  Plus, 
  Save, 
  Calendar, 
  CheckCircle2, 
  Trash2, 
  Zap, 
  Tag, 
  Flame, 
  Smile, 
  ShieldCheck,
  Edit3
} from 'lucide-react';

export function JournalView({ user }) {
  const storageKey = `tradetracker_journal_entries_v1:${user?.id || user?.email || 'anonymous'}`;
  const [entries, setEntries] = useState(() => {
    try {
      const data = user ? localStorage.getItem(storageKey) : null;
      return data ? JSON.parse(data) : [
        {
          id: 'j-1',
          date: new Date().toISOString().slice(0, 10),
          session: 'London Session',
          mood: 'Disciplined & Calm',
          title: 'Pre-Market Bias & Key Liquidity POIs',
          content: '1H Higher High structure sweep on BTC/USDT & NIFTY. Waiting for 15m MSS and 5m POI mitigation before taking long orders. Strictly risking 1% per execution.'
        }
      ];
    } catch(e) { return []; }
  });

  const [title, setTitle] = useState('');
  const [session, setSession] = useState('London Session');
  const [mood, setMood] = useState('Disciplined & Calm');
  const [content, setContent] = useState('');

  const handleAddEntry = (e) => {
    e.preventDefault();
    if (!title || !content) return;
    const newEntry = {
      id: `j-${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
      session,
      mood,
      title,
      content
    };
    const updated = [newEntry, ...entries];
    setEntries(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
    setTitle('');
    setContent('');
  };

  const handleDeleteEntry = (entryId) => {
    if (confirm('Are you sure you want to delete this journal entry?')) {
      const updated = entries.filter(e => e.id !== entryId);
      setEntries(updated);
      localStorage.setItem(storageKey, JSON.stringify(updated));
    }
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      
      {/* Top Header Bar */}
      <div className="p-6 rounded-2xl glass-box flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-[#38BDF8] font-jakarta tracking-tight flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-[#38BDF8]" />
            <span>Trading Journal & Mindset Notes</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Document pre-market plans, market conditions, execution rules, and psychological reflections.
          </p>
        </div>
      </div>

      {/* Write New Journal Entry Glass Form */}
      <form onSubmit={handleAddEntry} className="p-6 rounded-2xl glass-box space-y-4">
        <h3 className="text-sm font-bold text-white font-jakarta flex items-center space-x-2">
          <Edit3 className="w-4 h-4 text-[#38BDF8]" />
          <span>Write New Journal Entry</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            type="text"
            placeholder="Journal Title (e.g. NY Session Plan & BTC Liquidity Sweep)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="sm:col-span-2 px-4 py-2.5 bg-[#0B0F19] text-white text-xs rounded-xl border border-[#1E2638] font-bold focus:outline-none focus:border-[#38BDF8]"
            required
          />

          <select
            value={session}
            onChange={(e) => setSession(e.target.value)}
            className="px-3 py-2.5 bg-[#0B0F19] text-slate-200 text-xs font-bold rounded-xl border border-[#1E2638] focus:outline-none focus:border-[#38BDF8]"
          >
            <option value="Pre-Market">Pre-Market Open</option>
            <option value="Asian Session">Asian Session</option>
            <option value="London Session">London Session</option>
            <option value="NY Session">NY Session</option>
            <option value="Post-Market">Post-Market Review</option>
          </select>
        </div>

        <textarea
          rows="4"
          placeholder="Write your pre-market analysis, execution notes, or trading reflections..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full p-3.5 bg-[#0B0F19] text-white text-xs rounded-xl border border-[#1E2638] focus:outline-none focus:border-[#38BDF8] leading-relaxed"
          required
        />

        <div className="flex items-center justify-between pt-1">
          <select
            value={mood}
            onChange={(e) => setMood(e.target.value)}
            className="px-3 py-2 bg-[#0B0F19] text-slate-300 text-xs font-bold rounded-xl border border-[#1E2638] focus:outline-none focus:border-[#38BDF8]"
          >
            <option value="Disciplined & Calm">🧠 Disciplined & Calm</option>
            <option value="Focused & Patient">🎯 Focused & Patient</option>
            <option value="Anxious / Overtrading">⚠️ Anxious / High Energy</option>
            <option value="Confident">🔥 High Confidence</option>
          </select>

          <button
            type="submit"
            className="px-6 py-2.5 bg-gradient-to-r from-[#38BDF8] to-[#0284C7] hover:from-[#0284C7] hover:to-[#0369A1] text-white font-extrabold text-xs rounded-xl shadow-lg shadow-sky-500/20 transition flex items-center space-x-1.5 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Journal Entry</span>
          </button>
        </div>
      </form>

      {/* Journal Entry Cards List (Interactive Small/Medium Glass Boxes) */}
      <div className="space-y-4">
        {entries.map(e => (
          <div 
            key={e.id} 
            className="p-6 rounded-2xl glass-box space-y-3 relative group"
          >
            {/* Entry Header */}
            <div className="flex items-center justify-between border-b border-[#1E2638] pb-3">
              <div className="space-y-1">
                <h3 className="font-extrabold text-white text-base font-jakarta">{e.title}</h3>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#38BDF8]/10 border border-[#38BDF8]/30 text-[#38BDF8] text-[10px] font-bold font-mono">
                    {e.session || 'Session'}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#10B981]/10 border border-[#10B981]/30 text-[#10B981] text-[10px] font-bold font-mono">
                    {e.mood || 'Mindset'}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <span className="text-xs font-mono font-bold text-slate-400 bg-[#0B0F19] px-3 py-1 rounded-xl border border-[#1E2638]">
                  {e.date}
                </span>

                {/* Delete Entry Button */}
                <button
                  type="button"
                  onClick={() => handleDeleteEntry(e.id)}
                  className="p-1.5 rounded-xl bg-[#0B0F19] border border-[#1E2638] text-slate-400 hover:text-rose-400 hover:border-rose-500/40 hover:bg-rose-500/10 transition cursor-pointer"
                  title="Delete Journal Entry"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Content Body */}
            <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed font-sans">
              {e.content}
            </p>
          </div>
        ))}
      </div>

    </div>
  );
}
