import { NextRequest, NextResponse } from 'next/server';
import { listMembers } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const room = searchParams.get('room');
  if (!room) return NextResponse.json([]);
  const rows = await listMembers(room);
  return NextResponse.json(rows);
}
