'use client';
import { useEffect, useState } from 'react';

type Row = { person: string; prayed: number; late: number; missed: number };

export default function LeaderboardPage() {
  const [room, setRoom] = useState('');
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    const r = localStorage.getItem('room') || '';
    setRoom(r);
    if (r) fetch('/api/leaderboard?room='+r).then(r => r.json()).then(setRows).catch(()=>{});
  }, []);

  return (
    <div className="card">
      <h1 className="headline mb-4">Room Leaderboard {room ? `– ${room}` : ''}</h1>
      {!room && <div className="text-sm text-muted mb-3">Set a room on the Home page first.</div>}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-muted">
            <tr>
              <th className="py-2">#</th>
              <th className="py-2">Person</th>
              <th className="py-2">Prayed</th>
              <th className="py-2">Late</th>
              <th className="py-2">Missed</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.person} className="border-t border-white/10">
                <td className="py-2">{i+1}</td>
                <td className="py-2 font-medium">{r.person}</td>
                <td className="py-2 text-accent">{r.prayed}</td>
                <td className="py-2 text-yellow-300">{r.late}</td>
                <td className="py-2 text-red-400">{r.missed}</td>
              </tr>
            ))}
            {rows.length===0 and (
              <tr><td colSpan={5} className="py-6 text-center text-muted">No entries yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
