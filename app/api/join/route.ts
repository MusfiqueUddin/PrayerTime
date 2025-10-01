import { NextRequest, NextResponse } from 'next/server';
import { joinRoom, getRoom } from '@/lib/db';

export async function POST(req: NextRequest) {
  const { room, person } = await req.json();
  if (!room || !person) return NextResponse.json({ error: 'missing'}, { status: 400 });
  const r = await getRoom(room);
  if (!r) return NextResponse.json({ error: 'room not found' }, { status: 404 });
  const id = crypto.randomUUID();
  await joinRoom(id, room, person);
  return NextResponse.json({ ok: true });
}
