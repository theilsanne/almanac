// @ts-expect-error lunar-javascript has no types
import { Solar } from 'lunar-javascript';
import { getWisdomForDayOfYear } from './wisdomProvider';
import type { AlmanacData, GridDay } from './types';
import { placeholderData } from './types';

const GAN        = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
const ZHI        = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
const SHENG_XIAO = ['鼠','牛','虎','兔','龍','蛇','馬','羊','猴','雞','狗','豬'];

const LUNAR_MONTH_ZH = ['正','二','三','四','五','六','七','八','九','十','冬','臘'];
const LUNAR_MONTH_EN = [
  'FIRST','SECOND','THIRD','FOURTH','FIFTH','SIXTH',
  'SEVENTH','EIGHTH','NINTH','TENTH','ELEVENTH','TWELFTH',
];
const LUNAR_DAY_ZH = [
  '',
  '初一','初二','初三','初四','初五','初六','初七','初八','初九','初十',
  '十一','十二','十三','十四','十五','十六','十七','十八','十九','二十',
  '廿一','廿二','廿三','廿四','廿五','廿六','廿七','廿八','廿九','三十',
];
const MONTH_LONG  = ['JANUARY','FEBRUARY','MARCH','APRIL','MAY','JUNE','JULY','AUGUST','SEPTEMBER','OCTOBER','NOVEMBER','DECEMBER'];
const MONTH_SHORT = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
const DOW_ZH = ['週日','週一','週二','週三','週四','週五','週六'];
const DOW_EN = ['SUN','MON','TUE','WED','THU','FRI','SAT'];

// ── Yi / Ji maps keyed by dayZhiIdx (0=子 … 11=亥) ──────────────────────────
const YI_ZH: Record<number, string[]> = {
  0:  ['祭祀','入殮','移柩','安葬','入學'],
  1:  ['嫁娶','入宅','開市','出行','交易'],
  2:  ['出行','開市','交易','動土','安床'],
  3:  ['嫁娶','祭祀','開光','入宅','安香'],
  4:  ['開市','交易','動土','破土','安葬'],
  5:  ['嫁娶','出行','入宅','移徙','開市'],
  6:  ['祭祀','嫁娶','出行','開市','交易','動土'],
  7:  ['嫁娶','入宅','出行','交易','安床'],
  8:  ['入宅','嫁娶','出行','開市','交易'],
  9:  ['嫁娶','入宅','開市','祭祀','安香'],
  10: ['入宅','嫁娶','動土','破土','安葬'],
  11: ['嫁娶','入宅','出行','開市','交易'],
};
const JI_ZH: Record<number, string[]> = {
  0:  ['嫁娶','動土','開市','破土'],
  1:  ['動土','破土','安葬','祭祀'],
  2:  ['嫁娶','安葬','祭祀'],
  3:  ['動土','破土','出行','交易'],
  4:  ['嫁娶','入宅','安床','移徙'],
  5:  ['動土','破土','安葬'],
  6:  ['嫁娶','入宅','安床'],
  7:  ['動土','破土','安葬','祭祀'],
  8:  ['嫁娶','安葬','動土','破土'],
  9:  ['動土','破土','出行','移徙'],
  10: ['嫁娶','開市','入宅','安床'],
  11: ['動土','破土','安葬'],
};

// ── Solar term English names ─────────────────────────────────────────────────
const SOLAR_TERM_EN: Record<string, string> = {
  '小寒':'MINOR COLD',      '大寒':'MAJOR COLD',
  '立春':'START OF SPRING', '雨水':'RAIN WATER',
  '驚蟄':'INSECTS AWAKEN',  '春分':'SPRING EQUINOX',
  '清明':'CLEAR & BRIGHT',  '穀雨':'GRAIN RAIN',
  '立夏':'START OF SUMMER', '小滿':'GRAIN BUDS',
  '芒種':'GRAIN IN EAR',    '夏至':'SUMMER SOLSTICE',
  '小暑':'MINOR HEAT',      '大暑':'MAJOR HEAT',
  '立秋':'START OF AUTUMN', '處暑':'END OF HEAT',
  '白露':'WHITE DEW',       '秋分':'AUTUMN EQUINOX',
  '寒露':'COLD DEW',        '霜降':'FROST\'S DESCENT',
  '立冬':'START OF WINTER', '小雪':'MINOR SNOW',
  '大雪':'MAJOR SNOW',      '冬至':'WINTER SOLSTICE',
};

// ── Solar term dates 2024–2032 ───────────────────────────────────────────────
const SOLAR_TERMS: Record<number, Record<string, string>> = {
  2024: {'1-6':'小寒','1-20':'大寒','2-4':'立春','2-19':'雨水','3-5':'驚蟄','3-20':'春分','4-4':'清明','4-20':'穀雨','5-5':'立夏','5-21':'小滿','6-5':'芒種','6-21':'夏至','7-6':'小暑','7-22':'大暑','8-7':'立秋','8-22':'處暑','9-7':'白露','9-22':'秋分','10-8':'寒露','10-23':'霜降','11-7':'立冬','11-22':'小雪','12-7':'大雪','12-21':'冬至'},
  2025: {'1-5':'小寒','1-20':'大寒','2-3':'立春','2-18':'雨水','3-5':'驚蟄','3-20':'春分','4-4':'清明','4-20':'穀雨','5-5':'立夏','5-21':'小滿','6-5':'芒種','6-21':'夏至','7-7':'小暑','7-22':'大暑','8-7':'立秋','8-23':'處暑','9-7':'白露','9-23':'秋分','10-8':'寒露','10-23':'霜降','11-7':'立冬','11-22':'小雪','12-7':'大雪','12-22':'冬至'},
  2026: {'1-5':'小寒','1-20':'大寒','2-4':'立春','2-19':'雨水','3-6':'驚蟄','3-20':'春分','4-5':'清明','4-20':'穀雨','5-5':'立夏','5-21':'小滿','6-6':'芒種','6-21':'夏至','7-7':'小暑','7-23':'大暑','8-7':'立秋','8-23':'處暑','9-8':'白露','9-23':'秋分','10-8':'寒露','10-23':'霜降','11-7':'立冬','11-22':'小雪','12-7':'大雪','12-22':'冬至'},
  2027: {'1-5':'小寒','1-20':'大寒','2-4':'立春','2-19':'雨水','3-6':'驚蟄','3-21':'春分','4-5':'清明','4-21':'穀雨','5-6':'立夏','5-21':'小滿','6-6':'芒種','6-22':'夏至','7-7':'小暑','7-23':'大暑','8-8':'立秋','8-23':'處暑','9-8':'白露','9-23':'秋分','10-8':'寒露','10-24':'霜降','11-7':'立冬','11-23':'小雪','12-7':'大雪','12-22':'冬至'},
  2028: {'1-6':'小寒','1-21':'大寒','2-4':'立春','2-19':'雨水','3-5':'驚蟄','3-20':'春分','4-4':'清明','4-20':'穀雨','5-5':'立夏','5-20':'小滿','6-5':'芒種','6-21':'夏至','7-6':'小暑','7-22':'大暑','8-7':'立秋','8-22':'處暑','9-7':'白露','9-22':'秋分','10-8':'寒露','10-23':'霜降','11-7':'立冬','11-22':'小雪','12-6':'大雪','12-21':'冬至'},
  2029: {'1-5':'小寒','1-20':'大寒','2-3':'立春','2-18':'雨水','3-5':'驚蟄','3-20':'春分','4-4':'清明','4-20':'穀雨','5-5':'立夏','5-21':'小滿','6-5':'芒種','6-21':'夏至','7-6':'小暑','7-22':'大暑','8-7':'立秋','8-23':'處暑','9-7':'白露','9-22':'秋分','10-8':'寒露','10-23':'霜降','11-7':'立冬','11-22':'小雪','12-7':'大雪','12-21':'冬至'},
  2030: {'1-5':'小寒','1-20':'大寒','2-4':'立春','2-19':'雨水','3-6':'驚蟄','3-20':'春分','4-5':'清明','4-20':'穀雨','5-6':'立夏','5-21':'小滿','6-6':'芒種','6-21':'夏至','7-7':'小暑','7-23':'大暑','8-7':'立秋','8-23':'處暑','9-7':'白露','9-23':'秋分','10-8':'寒露','10-24':'霜降','11-7':'立冬','11-22':'小雪','12-7':'大雪','12-22':'冬至'},
  2031: {'1-6':'小寒','1-20':'大寒','2-4':'立春','2-19':'雨水','3-6':'驚蟄','3-21':'春分','4-5':'清明','4-21':'穀雨','5-6':'立夏','5-22':'小滿','6-6':'芒種','6-22':'夏至','7-8':'小暑','7-23':'大暑','8-8':'立秋','8-24':'處暑','9-8':'白露','9-23':'秋分','10-9':'寒露','10-24':'霜降','11-8':'立冬','11-23':'小雪','12-8':'大雪','12-22':'冬至'},
  2032: {'1-6':'小寒','1-21':'大寒','2-4':'立春','2-19':'雨水','3-5':'驚蟄','3-20':'春分','4-4':'清明','4-20':'穀雨','5-5':'立夏','5-20':'小滿','6-5':'芒種','6-21':'夏至','7-6':'小暑','7-22':'大暑','8-7':'立秋','8-22':'處暑','9-7':'白露','9-22':'秋分','10-7':'寒露','10-23':'霜降','11-7':'立冬','11-22':'小雪','12-6':'大雪','12-21':'冬至'},
};

// ── Days from local midnight Jan 1 2000 (reference: 甲午日, ganIdx=0, zhiIdx=6) ─
function daysDiffFrom2000(date: Date): number {
  const origin = new Date(2000, 0, 1).getTime();
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  return Math.round((target - origin) / 86_400_000);
}

// ── Day-of-year (1-based) ────────────────────────────────────────────────────
function dayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0).getTime();
  const now   = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  return Math.floor((now - start) / 86_400_000);
}

export function getAlmanacForDate(date: Date): AlmanacData {
  try {
    const year  = date.getFullYear();
    const month = date.getMonth() + 1;
    const day   = date.getDate();
    const dow   = date.getDay(); // 0=Sun…6=Sat

    // ── Lunar via lunar-javascript ───────────────────────────────────────────
    const solar = Solar.fromYmd(year, month, day);
    const lunar = solar.getLunar();

    const rawMonth    = lunar.getMonth() as number;   // negative = leap
    const isLeap      = rawMonth < 0;
    const lunarMonIdx = Math.abs(rawMonth);            // 1–12
    const lunarDayNum = lunar.getDay() as number;

    const lunarMonthZh = (isLeap ? '閏' : '') + (LUNAR_MONTH_ZH[lunarMonIdx - 1] ?? `${lunarMonIdx}`);
    const lunarMonthEn = (isLeap ? 'LEAP ' : '') + (LUNAR_MONTH_EN[lunarMonIdx - 1] ?? `${lunarMonIdx}`);
    const lunarDayZh   = LUNAR_DAY_ZH[lunarDayNum] ?? `${lunarDayNum}`;

    // ── GanZhi year + zodiac via lunar-javascript ────────────────────────────
    const yearGan    = lunar.getYearGan() as string;
    const yearZhi    = lunar.getYearZhi() as string;
    const yearGanIdx = GAN.indexOf(yearGan);
    const yearZhiIdx = ZHI.indexOf(yearZhi);

    // ── Day GanZhi + clash  ──────────────────────────────────────────────────
    // Reference: Jan 1 2000 = 甲午日 (ganIdx=0, zhiIdx=6)
    const diff       = daysDiffFrom2000(date);
    const dayGanIdx  = ((diff % 10) + 10) % 10;
    const dayZhiIdx  = ((6 + diff) % 12 + 12) % 12;
    const ganZhiDay  = GAN[dayGanIdx] + ZHI[dayZhiIdx];
    const clashZhi   = (dayZhiIdx + 6) % 12;
    const clash      = '沖' + ZHI[clashZhi] + SHENG_XIAO[clashZhi];

    // ── Solar term ───────────────────────────────────────────────────────────
    const termZh = SOLAR_TERMS[year]?.[`${month}-${day}`] ?? '';
    const termEn = SOLAR_TERM_EN[termZh] ?? '';

    // ── Daily wisdom ─────────────────────────────────────────────────────────
    const wisdom = getWisdomForDayOfYear(dayOfYear(date));

    return {
      dayNum:           day,
      monthNum:         month,
      monthEnglish:     MONTH_LONG[month - 1]  ?? '',
      monthShort:       MONTH_SHORT[month - 1] ?? '',
      weekday:          DOW_ZH[dow],
      weekdayShort:     DOW_EN[dow],
      lunarMonth:       lunarMonthZh,
      lunarMonthEnglish: lunarMonthEn,
      lunarDay:         lunarDayZh,
      lunarDayNum:      lunarDayNum,
      ganZhiYear:       GAN[yearGanIdx] + ZHI[yearZhiIdx],
      shengXiao:        SHENG_XIAO[yearZhiIdx],
      ganZhiDay,
      clash,
      solarTerm:        termZh,
      solarTermEnglish: termEn,
      yi:               YI_ZH[dayZhiIdx] ?? [],
      ji:               JI_ZH[dayZhiIdx] ?? [],
      wisdomChinese:    wisdom.chinese,
      wisdomPinyin:     wisdom.pinyin,
      wisdomEnglish:    wisdom.english,
      wisdomSource:     wisdom.source,
      wisdomAuthor:     wisdom.author,
    };
  } catch {
    return placeholderData();
  }
}

export function getMonthGridData(year: number, month: number): { offset: number; days: GridDay[] } {
  // Monday-start offset of the 1st
  const firstDow = new Date(year, month - 1, 1).getDay(); // 0=Sun
  const offset   = (firstDow + 6) % 7;                    // Mon=0…Sun=6

  const daysInMonth = new Date(year, month, 0).getDate();
  const termMap     = SOLAR_TERMS[year] ?? {};

  const days: GridDay[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const solar    = Solar.fromYmd(year, month, d);
    const lunar    = solar.getLunar();
    const rawMon   = lunar.getMonth() as number;
    const isLeap   = rawMon < 0;
    const monIdx   = Math.abs(rawMon);
    const lDay     = lunar.getDay() as number;

    const lunarDay = lDay === 1
      ? (isLeap ? '閏' : '') + (LUNAR_MONTH_ZH[monIdx - 1] ?? `${monIdx}`) + '月'
      : (LUNAR_DAY_ZH[lDay] ?? `${lDay}`);

    days.push({ dayNum: d, lunarDay, solarTerm: termMap[`${month}-${d}`] ?? '' });
  }

  return { offset, days };
}
