'use client';
import { useEffect, useMemo, useState } from 'react';
import { format, subDays } from 'date-fns';

type Entry = {
  id: string;
  room_code: string;
  person: string;
  date: string;
  prayer: 'fajr'|'dhuhr'|'asr'|'maghrib'|'isha';
  status: 'prayed'|'late'|'missed';
  created_at: string;
};

export default function HistoryPage() {
  const [room, setRoom] = useState('');
  const [person, setPerson] = useState('');
  const [data, setData] = useState<Entry[]>([]);

  useEffect(() => {
    setRoom(localStorage.getItem('room') || '');
    setPerson(localStorage.getItem('person') || '');
  }, []);

  const since = useMemo(() => format(subDays(new Date(), 6), 'yyyy-MM-dd'), []);

  useEffect(() => {
    if (!room || !person) return;
    fetch(`/api/history?room=${room}&person=${encodeURIComponent(person)}&since=${since}`)
      .then(r => r.json()).then(setData).catch(()=>{});
  }, [room, person, since]);

  const days = Array.from(new Set(data.map(d => d.date))).sort().reverse();

  return (
    <div className="card">
      <h1 className="headline mb-4">7-Day History {person ? `– ${person}` : ''}</h1>
      {!room && <div className="text-sm text-muted mb-3">Set a room on the Home page first.</div>}
      <div className="space-y-4">
        {days.length===0 && <div className="text-muted text-sm">No data yet.</div>}
        {days.map(day => (
          <div key={day} className="bg-black/20 rounded-xl p-3 border border-white/5">
            <div className="text-sm text-neon mb-2">{day}</div>
            <div className="grid grid-cols-5 gap-2 text-sm">
              {(['fajr','dhuhr','asr','maghrib','isha'] as const).map(p => {
                const entry = data.find(e => e.date===day && e.prayer===p);
                const label = entry?.status ?? '—';
                const color = entry?.status==='prayed' ? 'bg-accent/20 border-accent/40' :
                              entry?.status==='late' ? 'bg-yellow-400/20 border-yellow-400/40' :
                              entry?.status==='missed' ? 'bg-red-400/20 border-red-400/40' :
                              'bg-white/5 border-white/10';
                return (
                  <div key={p} className={`rounded-lg border px-3 py-2 ${color}`}>
                    <div className="text-xs text-muted">{p.toUpperCase()}</div>
                    <div className="font-medium">{label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
