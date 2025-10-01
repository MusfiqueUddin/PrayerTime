import { PrayerTimes, Coordinates, CalculationMethod, Madhab, Prayer } from 'adhan';

const dhaka = new Coordinates(23.8103, 90.4125);

export type TodayTimes = {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
};

export function bangladeshParams() {
  const params = CalculationMethod.MuslimWorldLeague();
  params.madhab = Madhab.Hanafi;
  return params;
}

export function formatTime(d: Date, tz: string) {
  return new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: tz,
  }).format(d);
}

export function getTodayTimes(date = new Date(), tz = 'Asia/Dhaka'): TodayTimes {
  const times = new PrayerTimes(dhaka, date, bangladeshParams());
  return {
    fajr: formatTime(times.fajr, tz),
    sunrise: formatTime(times.sunrise, tz),
    dhuhr: formatTime(times.dhuhr, tz),
    asr: formatTime(times.asr, tz),
    maghrib: formatTime(times.maghrib, tz),
    isha: formatTime(times.isha, tz),
  };
}

type NextLabel = 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha' | 'none';

export function getNextPrayer(date = new Date(), tz = 'Asia/Dhaka') {
  const pt = new PrayerTimes(dhaka, date, bangladeshParams());
  const next = pt.nextPrayer();
  const time = next ? pt.timeForPrayer(next) : null;

  let label: NextLabel = 'none';
  switch (next) {
    case Prayer.Fajr: label = 'fajr'; break;
    case Prayer.Sunrise: label = 'sunrise'; break;
    case Prayer.Dhuhr: label = 'dhuhr'; break;
    case Prayer.Asr: label = 'asr'; break;
    case Prayer.Maghrib: label = 'maghrib'; break;
    case Prayer.Isha: label = 'isha'; break;
    default: label = 'none';
  }

  return { next: label, time };
}
