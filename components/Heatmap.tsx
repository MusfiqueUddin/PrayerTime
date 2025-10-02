'use client';
import { eachDayOfInterval, endOfWeek, format, startOfWeek, subDays } from 'date-fns';

type Props = {
  days?: number;
  /** map of ISO date (yyyy-MM-dd) -> integer 0..5  */
  data: Record<string, number>;
};

export default function Heatmap({ days = 120, data }: Props) {
  const today = new Date();
  const start = subDays(today, days - 1);

  const weeks: Date[][] = [];
  let cursor = startOfWeek(start, { weekStartsOn: 0 });
  const last = endOfWeek(today, { weekStartsOn: 0 });

  while (cursor <= last) {
    const weekEnd = endOfWeek(cursor, { weekStartsOn: 0 });
    const week = eachDayOfInterval({ start: cursor, end: weekEnd });
    weeks.push(week);
    cursor = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() + 7);
  }

  const box = 12, gap = 2;

  const color = (v: number) => {
    // exact mapping you requested
    switch (Math.max(0, Math.min(5, v|0))) {
      case 5: return '#22c55e';      // green
      case 4: return '#86efac';      // light green
      case 3: return '#fde047';      // yellow
      case 2: return '#fdba74';      // light orange
      case 1: return '#fb923c';      // orange
      default: return '#ef4444';     // red (0/5)
    }
  };

  return (
    <svg
      width={(box + gap) * weeks.length}
      height={(box + gap) * 7}
      role="img"
      aria-label="Prayer activity heatmap"
    >
      {weeks.map((week, x) =>
        week.map((d, y) => {
          const key = format(d, 'yyyy-MM-dd');
          const v = data[key] ?? 0;
          return (
            <g key={key} transform={`translate(${x * (box + gap)}, ${y * (box + gap)})`}>
              <rect
                width={box}
                height={box}
                rx="2"
                ry="2"
                fill={color(v)}
                stroke="rgba(255,255,255,0.08)"
              />
              <title>{key}: {v}/5 prayers</title>
            </g>
          );
        })
      )}
    </svg>
  );
}
