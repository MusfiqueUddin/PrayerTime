import { NextRequest, NextResponse } from 'next/server';
import { listMembers, getHeatmapForMember } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const room = searchParams.get('room');
  const since = searchParams.get('since') || '1970-01-01';
  if (!room) return NextResponse.json({});
  const members = await listMembers(room);
  const result: Record<string, Record<string, number>> = {};
  for (const m of members) {
    const rows = await getHeatmapForMember(room, m.person, since);
    result[m.person] = {};
    for (const r of rows) {
      result[m.person][r.date] = Number(r.prayed_count);
    }
  }
  return NextResponse.json(result);
}
