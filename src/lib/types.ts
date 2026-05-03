export interface AlmanacData {
  dayNum: number;
  monthNum: number;
  monthEnglish: string;
  monthShort: string;
  weekday: string;
  weekdayShort: string;
  lunarMonth: string;
  lunarMonthEnglish: string;
  lunarDay: string;
  lunarDayNum: number;
  ganZhiYear: string;
  shengXiao: string;
  ganZhiDay: string;
  clash: string;
  solarTerm: string;
  solarTermEnglish: string;
  yi: string[];
  ji: string[];
  wisdomChinese: string;
  wisdomPinyin: string;
  wisdomEnglish: string;
  wisdomSource: string;
  wisdomAuthor: string;
}

export function lunarLabel(d: AlmanacData): string {
  return `${d.ganZhiYear}年 · ${d.lunarMonth}月${d.lunarDay}`;
}

export interface GridDay {
  dayNum: number;
  lunarDay: string;
  solarTerm: string;
}

export function placeholderData(): AlmanacData {
  return {
    dayNum: 0, monthNum: 0,
    monthEnglish: '—', monthShort: '—',
    weekday: '—', weekdayShort: '—',
    lunarMonth: '—', lunarMonthEnglish: '—',
    lunarDay: '—', lunarDayNum: 0,
    ganZhiYear: '—', shengXiao: '—',
    ganZhiDay: '—', clash: '—',
    solarTerm: '', solarTermEnglish: '',
    yi: [], ji: [],
    wisdomChinese: '—', wisdomPinyin: '—',
    wisdomEnglish: '—', wisdomSource: '—', wisdomAuthor: '',
  };
}
