'use client';
import { useEffect, useMemo, useState } from 'react';
import { format, subDays } from 'date-fns';
import Heatmap from '@/components/Heatmap';
import { getTodayTimes, getNextPrayer } from '@/lib/prayer';

type PrayerName = 'fajr'|'dhuhr'|'asr'|'maghrib'|'isha';
type Status = 'prayed'|'late'|'missed';

export default function RoomPage({ params }: { params: { code: string } }) {
  const room = params.code;
  const [person, setPerson] = useState('');
  const [now, setNow] = useState(new Date());
  const [members, setMembers] = useState<{id:string, person:string}[]>([]);
  const [heat, setHeat] = useState<Record<string, Record<string, number>>>({});
  const [statusMap, setStatusMap] = useState<Record<PrayerName, Status | null>>({
    fajr: null, dhuhr: null, asr: null, maghrib: null, isha: null
  });

  const today = useMemo(() => format(now, 'yyyy-MM-dd'), [now]);
  const times = useMemo(() => getTodayTimes(now), [now]);

  useEffect(() => {
    const p = localStorage.getItem('person') || '';
    setPerson(p);
    const id = setInterval(()=>setNow(new Date()), 1000);
    return ()=>clearInterval(id);
  }, []);

  useEffect(() => {
    if (!person) return;
    fetch('/api/join', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ room, person })}).catch(()=>{});
  }, [room, person]);

  useEffect(() => {
    refreshMembers(); refreshHeatmaps();
  }, [room]);

  async function refreshMembers() {
    const m = await fetch(`/api/members?room=${room}`).then(r=>r.json()).catch(()=>[]);
    setMembers(m);
  }
  async function refreshHeatmaps() {
    const since = format(subDays(new Date(), 119), 'yyyy-MM-dd');
    const m = await fetch(`/api/heatmap?room=${room}&since=${since}`).then(r=>r.json()).catch(()=>({}));
    setHeat(m);
  }

  const { next, time } = useMemo(() => getNextPrayer(now), [now]);
  const countdown = useMemo(() => {
    if (!time) return '—';
    const diff = +time - +now;
    if (diff <= 0) return 'started';
    const s = Math.floor(diff/1000);
    const h = Math.floor(s/3600).toString().padStart(2,'0');
    const m = Math.floor((s%3600)/60).toString().padStart(2,'0');
    const ss = (s%60).toString().padStart(2,'0');
    return `${h}:${m}:${ss}`;
  }, [time, now]);

  async function mark(prayer: PrayerName, status: Status) {
    if (!person) { alert('Save your name on Home page first!'); return; }
    const res = await fetch('/api/entry', {
      method: 'POST', headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ room, person, date: today, prayer, status })
    });
    const data = await res.json().catch(()=>null);
    if (!res.ok) return alert('Failed to save: ' + (data?.error || res.statusText));
    // locally highlight selected status
    setStatusMap(prev => ({ ...prev, [prayer]: status }));
    await refreshHeatmaps();
  }

  return (
    <div className="space-y-6">
      <section className="card">
        <div className="flex flex-col md:flex-row md:items-end gap-3 justify-between">
          <div>
            <h1 className="headline">Room: <span className="text-neon break-all">{room}</span></h1>
            <p className="text-muted text-sm">Today: <span className="text-neon">{format(now, 'PPP')}</span></p>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted">Next prayer</div>
            <div className="text-3xl font-bold capitalize">{next}</div>
            <div className="text-5xl font-mono mt-2">{countdown}</div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-5">
          <div className="md:col-span-3 grid grid-cols-3 md:grid-cols-6 text-center gap-3">
            <Time label="Fajr" value={times.fajr} />
            <Time label="Sunrise" value={times.sunrise} />
            <Time label="Dhuhr" value={times.dhuhr} />
            <Time label="Asr" value={times.asr} />
            <Time label="Maghrib" value={times.maghrib} />
            <Time label="Isha" value={times.isha} />
          </div>
        </div>
      </section>

      <section className="card">
        <h2 className="headline mb-3">Mark today</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {(['fajr','dhuhr','asr','maghrib','isha'] as PrayerName[]).map((p) => (
            <div key={p} className="p-4 bg-black/20 rounded-xl border border-white/5">
              <div className="text-sm text-muted">{p.toUpperCase()}</div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                <MarkBtn active={statusMap[p] === 'prayed'}  onClick={() => mark(p,'prayed')}  label="Prayed"  kind="prayed"  />
                <MarkBtn active={statusMap[p] === 'late'}    onClick={() => mark(p,'late')}    label="Late"    kind="late"    />
                <MarkBtn active={statusMap[p] === 'missed'}  onClick={() => mark(p,'missed')}  label="Missed"  kind="missed"  />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="card">
        <h2 className="headline mb-4">Members & Heatmaps (last 120 days)</h2>
        <div className="space-y-8">
          {members.map(m => (
            <div key={m.id}>
              <div className="mb-2 font-medium">{m.person}</div>
              <div className="overflow-x-auto">
                {/* one heatmap per person */}
                <Heatmap days={120} data={heat[m.person] || {}} />
              </div>
            </div>
          ))}
          {members.length===0 && <div className="text-muted text-sm">No members yet. Share your room code.</div>}
        </div>
      </section>
    </div>
  );
}

function Time({label, value}:{label:string, value:string}) {
  return (
    <div className="bg-black/20 rounded-xl p-3 border border-white/5 text-center">
      <div className="text-xs text-muted">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  );
}

function MarkBtn({
  label, onClick, kind, active
}: {label:string; onClick:()=>void; kind: 'prayed'|'late'|'missed'; active?: boolean}) {
  const base =
    'cursor-pointer select-none transition-transform active:scale-95 focus:outline-none focus:ring ' +
    'px-2 py-2 rounded-lg text-xs border w-full';
  const palette =
    kind === 'prayed'
      ? active
        ? 'bg-emerald-500 text-black border-emerald-500'
        : 'bg-emerald-500/10 text-white border-emerald-400/50 hover:bg-emerald-500/20'
      : kind === 'late'
      ? active
        ? 'bg-yellow-400 text-black border-yellow-400'
        : 'bg-yellow-400/10 text-white border-yellow-400/50 hover:bg-yellow-400/20'
      : active
        ? 'bg-red-400 text-black border-red-400'
        : 'bg-red-400/10 text-white border-red-400/50 hover:bg-red-400/20';

  return (
    <button type="button" onClick={onClick} className={`${base} ${palette}`}>
      {label}
    </button>
  );
}
