import { NextRequest, NextResponse } from 'next/server';
import { getEntries } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const room = searchParams.get('room');
  const person = searchParams.get('person');
  const since = searchParams.get('since') ?? undefined;
  if (!room || !person) return NextResponse.json([]);
  const rows = await getEntries(room, person, since || undefined);
  return NextResponse.json(rows);
}
