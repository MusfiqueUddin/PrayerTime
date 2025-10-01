import { NextRequest, NextResponse } from 'next/server';
import { addEntry } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { room, person, date, prayer, status } = await req.json();
    if (!room || !person || !date || !prayer || !status) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }
    const id = crypto.randomUUID();
    await addEntry(id, { room_code: room, person, date, prayer, status });
    return NextResponse.json({ ok: true });
  } catch (e:any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
