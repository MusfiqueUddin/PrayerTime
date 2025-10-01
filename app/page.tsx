'use client';
import { useEffect, useState } from 'react';

export default function Home() {
  const [room, setRoom] = useState('');
  const [name, setName] = useState('');

  useEffect(() => {
    setRoom(localStorage.getItem('room') || '');
    setName(localStorage.getItem('person') || '');
  }, []);

  function saveName() {
    if (!name.trim()) return alert('Enter your name');
    localStorage.setItem('person', name.trim());
    alert('Name saved');
  }

  async function createRoom() {
    if (!name.trim()) return alert('Save your name first');
    const desired = room || randomCode();
    const res = await fetch('/api/room', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ code: desired, name: desired })});
    const data = await res.json().catch(()=>({}));
    if (!res.ok) return alert('Create failed: ' + (data?.error || res.statusText));
    localStorage.setItem('room', desired);
    window.location.href = `/room/${desired}`;
  }

  function joinRoom() {
    if (!name.trim()) return alert('Save your name first');
    if (!room.trim()) return alert('Enter room code');
    localStorage.setItem('room', room.trim());
    window.location.href = `/room/${room.trim()}`;
  }

  return (
    <div className="grid gap-6">
      <section className="card">
        <h1 className="headline mb-2">PrayerUp — Rooms & Heatmaps</h1>
        <p className="text-muted">Enter your name (used across the app), then create or join a room.</p>
      </section>

      <section className="card grid gap-3">
        <h2 className="font-semibold">Your Name</h2>
        <div className="flex flex-col md:flex-row gap-2">
          <input value={name} onChange={e=>setName(e.target.value)} placeholder="your name"
                 className="input w-full md:max-w-md" />
          <button onClick={saveName} className="btn btn-neon w-full md:w-auto">Save</button>
        </div>
        <p className="text-xs text-muted">This name will be shown to others in your room.</p>
      </section>

      <section className="card grid md:grid-cols-2 gap-5">
        <div>
          <h2 className="font-semibold">Create Room</h2>
          <div className="mt-3 flex gap-2">
            <input value={room} onChange={e=>setRoom(e.target.value)} placeholder="room code (e.g., friends-room)"
                   className="input w-full" />
            <button onClick={createRoom} className="btn btn-accent">Create</button>
          </div>
          <p className="text-xs text-muted mt-2">Leave blank to auto-generate a code.</p>
        </div>
        <div>
          <h2 className="font-semibold">Join Room</h2>
          <div className="mt-3 flex gap-2">
            <input value={room} onChange={e=>setRoom(e.target.value)} placeholder="room code"
                   className="input w-full" />
            <button onClick={joinRoom} className="btn btn-neon">Join</button>
          </div>
        </div>
      </section>
    </div>
  );
}

function randomCode() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let s='room-';
  for (let i=0;i<6;i++) s+=chars[Math.floor(Math.random()*chars.length)];
  return s;
}
