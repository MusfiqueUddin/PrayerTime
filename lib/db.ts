import { sql } from '@vercel/postgres';

export type PrayerName = 'fajr'|'dhuhr'|'asr'|'maghrib'|'isha';
export type Status = 'prayed'|'late'|'missed';

async function createUniqueMembersIndexSafely() {
  try {
    // First attempt: fast path if there are no duplicates.
    await sql`CREATE UNIQUE INDEX IF NOT EXISTS uniq_members_room_person ON members(room_code, person);`;
  } catch (e: any) {
    const msg = String(e?.message || e);
    // If duplicates exist, Postgres throws "could not create unique index ..."
    if (msg.includes('could not create unique index') || msg.includes('duplicate key value')) {
      // Remove duplicates, keep the earliest row for each (room_code, person)
      await sql`
        DELETE FROM members a
        USING members b
        WHERE a.ctid > b.ctid
          AND a.room_code = b.room_code
          AND a.person = b.person;
      `;
      // Retry creating the unique index
      await sql`CREATE UNIQUE INDEX IF NOT EXISTS uniq_members_room_person ON members(room_code, person);`;
    } else {
      throw e; // Bubble up unknown errors
    }
  }
}

export async function ensureSchema() {
  await sql`CREATE TABLE IF NOT EXISTS rooms (
    code TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );`;

  await sql`CREATE TABLE IF NOT EXISTS members (
    id TEXT PRIMARY KEY,
    room_code TEXT NOT NULL REFERENCES rooms(code) ON DELETE CASCADE,
    person TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );`;

  await sql`CREATE TABLE IF NOT EXISTS entries (
    id TEXT PRIMARY KEY,
    room_code TEXT NOT NULL REFERENCES rooms(code) ON DELETE CASCADE,
    person TEXT NOT NULL,
    date TEXT NOT NULL,
    prayer TEXT NOT NULL,
    status TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );`;

  await sql`CREATE INDEX IF NOT EXISTS idx_entries_room_date_person ON entries(room_code, date, person);`;

  // Ensure one row per (room_code, person); dedupe on the fly if needed
  await createUniqueMembersIndexSafely();
}

export async function createRoom(code: string, name: string) {
  await ensureSchema();
  await sql`INSERT INTO rooms (code, name) VALUES (${code}, ${name})
            ON CONFLICT (code) DO NOTHING;`;
  return { code, name };
}

export async function getRoom(code: string) {
  await ensureSchema();
  const { rows } = await sql`SELECT * FROM rooms WHERE code=${code}`;
  return rows[0] as { code:string, name:string } | undefined;
}

export async function joinRoom(memberId: string, code: string, person: string) {
  await ensureSchema();
  // Upsert on (room_code, person) so we never create duplicates again
  await sql`
    INSERT INTO members (id, room_code, person)
    VALUES (${memberId}, ${code}, ${person})
    ON CONFLICT (room_code, person)
    DO UPDATE SET person = EXCLUDED.person;
  `;
}

export async function listMembers(code: string) {
  await ensureSchema();
  // Distinct by person (hides any legacy dupes that might slip through)
  const { rows } = await sql`
    SELECT MIN(id) AS id, person
    FROM members
    WHERE room_code=${code}
    GROUP BY person
    ORDER BY person ASC;
  `;
  return rows as { id:string, person:string }[];
}

export async function addEntry(
  entryId: string,
  e: { room_code:string; person:string; date:string; prayer:PrayerName; status:Status }
) {
  await ensureSchema();
  await sql`INSERT INTO entries (id, room_code, person, date, prayer, status)
            VALUES (${entryId}, ${e.room_code}, ${e.person}, ${e.date}, ${e.prayer}, ${e.status});`;
}

export async function getEntries(room: string, person: string, sinceISO?: string) {
  await ensureSchema();
  if (sinceISO) {
    const { rows } = await sql`
      SELECT * FROM entries
      WHERE room_code=${room} AND person=${person} AND date >= ${sinceISO}
      ORDER BY date ASC`;
    return rows as any[];
  }
  const { rows } = await sql`
    SELECT * FROM entries
    WHERE room_code=${room} AND person=${person}
    ORDER BY date ASC`;
  return rows as any[];
}

export async function getHeatmapForMember(room: string, person: string, sinceISO: string) {
  await ensureSchema();
  const { rows } = await sql`
    SELECT date, SUM(CASE WHEN status='prayed' THEN 1 ELSE 0 END) AS prayed_count
    FROM entries
    WHERE room_code=${room} AND person=${person} AND date >= ${sinceISO}
    GROUP BY date ORDER BY date ASC;
  `;
  return rows as { date:string, prayed_count:string }[];
}

export async function getRoomLeaderboard(room: string) {
  await ensureSchema();
  const { rows } = await sql`
    SELECT person,
      SUM(CASE WHEN status='prayed' THEN 1 ELSE 0 END) AS prayed,
      SUM(CASE WHEN status='late' THEN 1 ELSE 0 END) AS late,
      SUM(CASE WHEN status='missed' THEN 1 ELSE 0 END) AS missed
    FROM entries
    WHERE room_code=${room}
    GROUP BY person
    ORDER BY prayed DESC, late ASC, missed ASC;
  `;
  return rows as { person: string, prayed: number, late: number, missed: number }[];
}
