'use client';
import { eachDayOfInterval, endOfWeek, format, startOfWeek, subDays } from 'date-fns';

type Props = { days?: number; data: Record<string, number> };

export default function Heatmap({ days = 120, data }: Props) {
  const today = new Date();
  const start = subDays(today, days-1);
  const weeks: Date[][] = [];
  let cursor = startOfWeek(start, { weekStartsOn: 0 });
  const last = endOfWeek(today, { weekStartsOn: 0 });
  while (cursor <= last) {
    const end = endOfWeek(cursor, { weekStartsOn: 0 });
    const week = eachDayOfInterval({ start: cursor, end });
    weeks.push(week);
    cursor = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() + 7);
  }
  const box = 12, gap = 2, max = 5;
  const color = (v:number) => v<=0 ? 'rgba(255,255,255,0.08)' : `rgba(110,231,255,${0.15 + 0.7*(v/max)})`;

  return (
    <svg width={(box+gap)*weeks.length} height={(box+gap)*7} role="img" aria-label="Prayer activity heatmap">
      {weeks.map((week, x) => week.map((d, y) => {
        const key = format(d, 'yyyy-MM-dd');
        const v = data[key] ?? 0;
        return (
          <g key={key} transform={`translate(${x*(box+gap)}, ${y*(box+gap)})`}>
            <rect width={box} height={box} rx="2" ry="2" fill={color(Number(v))} stroke="rgba(255,255,255,0.08)"/>
            <title>{key}: {v}/5 prayers</title>
          </g>
        );
      }))}
    </svg>
  );
}
