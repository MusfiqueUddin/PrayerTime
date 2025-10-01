import { NextRequest, NextResponse } from 'next/server';
import { createRoom } from '@/lib/db';

export async function POST(req: NextRequest) {
  const { code, name } = await req.json();
  if (!code || !name) return NextResponse.json({ error: 'missing'}, { status: 400 });
  await createRoom(code, name);
  return NextResponse.json({ ok: true, code });
}
