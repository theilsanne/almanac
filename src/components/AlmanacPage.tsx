import { useState, useMemo, useCallback } from 'react';
import { getAlmanacForDate } from '../lib/lunarCalendar';
import { lunarLabel } from '../lib/types';
import { HDivider } from './HDivider';
import { NavArrow } from './NavArrow';
import { MonthGrid } from './MonthGrid';
import { YiJiSection } from './YiJiSection';

const DAY_MS = 24 * 60 * 60 * 1000;

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

function todayMidnight(): Date {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12, 0, 0);
}

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth()     === b.getMonth()
    && a.getDate()      === b.getDate();
}

export function AlmanacPage() {
  const today = useMemo(todayMidnight, []);

  const [current, setCurrent]  = useState<Date>(today);
  const [expanded, setExpanded] = useState(false);
  const [gridYear,  setGridYear]  = useState(today.getFullYear());
  const [gridMonth, setGridMonth] = useState(today.getMonth() + 1);

  const isToday = sameDay(current, today);
  const data = useMemo(() => getAlmanacForDate(current), [current]);

  const navigateDay = useCallback((delta: number) => {
    setCurrent(prev => new Date(prev.getTime() + delta * DAY_MS));
  }, []);

  const navigateMonth = useCallback((delta: number) => {
    setGridMonth(prev => {
      let m = prev + delta;
      if (m < 1)  { setGridYear(y => y - 1); m = 12; }
      if (m > 12) { setGridYear(y => y + 1); m = 1;  }
      return m;
    });
  }, []);

  const handleNavLeft  = useCallback(() => expanded ? navigateMonth(-1) : navigateDay(-1), [expanded, navigateDay, navigateMonth]);
  const handleNavRight = useCallback(() => expanded ? navigateMonth(1)  : navigateDay(1),  [expanded, navigateDay, navigateMonth]);

  const toggleExpanded = useCallback(() => {
    setExpanded(v => {
      if (!v) {
        setGridYear(current.getFullYear());
        setGridMonth(current.getMonth() + 1);
      }
      return !v;
    });
  }, [current]);

  const handleDaySelected = useCallback((date: Date) => {
    setCurrent(date);
    setExpanded(false);
  }, []);

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'var(--paper)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: 'env(safe-area-inset-top, 0px) 0 env(safe-area-inset-bottom, 24px)',
    }}>
      <div style={{
        width: '100%', maxWidth: 480,
        padding: '24px 28px',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: 0,
      }}>

        {/* ── Nav row ── */}
        <div style={{
          width: '100%',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <NavArrow onClick={handleNavLeft} />

          <button
            onClick={toggleExpanded}
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              borderRadius: 8, padding: '8px 10px',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <span style={{
              fontFamily: 'var(--geist)', fontWeight: 400,
              fontSize: 13, letterSpacing: '0.15em',
              color: 'var(--secondary)',
            }}>
              {expanded
                ? `${MONTH_NAMES[gridMonth - 1].toUpperCase()} ${gridYear}`
                : `${data.monthEnglish} · ${data.weekdayShort}`}
            </span>
            <svg
              width="18" height="18" viewBox="0 0 24 24" fill="none"
              style={{
                transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s',
                opacity: 0.7,
              }}
            >
              <path d="M7 10l5 5 5-5" stroke="var(--secondary)" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <NavArrow forward onClick={handleNavRight} />
        </div>

        {/* ── 今日 pill ── */}
        <div style={{
          overflow: 'hidden',
          maxHeight: isToday ? 0 : 40,
          opacity: isToday ? 0 : 1,
          transition: 'max-height 0.25s ease, opacity 0.2s ease',
          marginTop: isToday ? 0 : 6,
        }}>
          <button
            onClick={() => { setCurrent(today); setExpanded(false); }}
            style={{
              background: 'rgba(87,74,59,0.12)',
              borderRadius: 20, padding: '4px 14px',
              fontFamily: 'var(--geist)', fontWeight: 500,
              fontSize: 11, color: 'var(--secondary)',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            今日
          </button>
        </div>

        {/* ── Month calendar ── */}
        <div style={{
          width: '100%',
          overflow: 'hidden',
          maxHeight: expanded ? 600 : 0,
          opacity: expanded ? 1 : 0,
          transition: 'max-height 0.3s ease, opacity 0.25s ease',
        }}>
          <div style={{ height: 16 }} />
          <HDivider />
          <div style={{ height: 8 }} />
          <MonthGrid
            gridYear={gridYear}
            gridMonth={gridMonth}
            selectedYear={current.getFullYear()}
            selectedMonth={current.getMonth() + 1}
            selectedDay={current.getDate()}
            todayYear={today.getFullYear()}
            todayMonth={today.getMonth() + 1}
            todayDay={today.getDate()}
            onDaySelected={handleDaySelected}
          />
          <div style={{ height: 8 }} />
          <HDivider />
        </div>

        {/* ── Date hero ── */}
        <div style={{ height: 2 }} />
        <span style={{
          fontFamily: 'var(--fraunces)', fontWeight: 300,
          fontSize: 'clamp(80px, 22vw, 100px)',
          color: 'var(--ink)', lineHeight: 1,
        }}>
          {data.dayNum}
        </span>
        <div style={{ height: 2 }} />
        <span style={{
          fontFamily: 'var(--fraunces)', fontWeight: 400,
          fontSize: 16, color: 'var(--brown-mid)',
        }}>
          {lunarLabel(data)}
        </span>
        <div style={{ height: 2 }} />
        <span style={{
          fontFamily: 'var(--geist)', fontWeight: 400,
          fontSize: 13, color: 'var(--secondary)',
        }}>
          {data.ganZhiDay}日 · {data.clash}
        </span>

        {/* ── Solar term ── */}
        {data.solarTerm && (
          <>
            <div style={{ height: 22 }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                background: 'var(--deep-red)', borderRadius: 8,
                padding: '6px 14px',
              }}>
                <span style={{
                  fontFamily: 'var(--geist)', fontWeight: 600,
                  fontSize: 14, color: '#fff',
                }}>
                  節氣 · {data.solarTerm}
                </span>
              </div>
              <span style={{
                fontFamily: 'var(--geist)', fontWeight: 400,
                fontSize: 13, letterSpacing: '0.07em',
                color: 'var(--secondary)',
              }}>
                {data.solarTermEnglish}
              </span>
            </div>
          </>
        )}

        {/* ── Divider ── */}
        <div style={{ height: 28 }} />
        <HDivider />
        <div style={{ height: 28 }} />

        {/* ── Wisdom ── */}
        <span style={{
          fontFamily: 'var(--geist)', fontWeight: 400,
          fontSize: 11, letterSpacing: '0.25em',
          color: 'var(--secondary)',
        }}>
          今日格言
        </span>
        <div style={{ height: 16 }} />
        <span style={{
          fontFamily: 'var(--fraunces)', fontWeight: 300,
          fontSize: 24, color: 'var(--ink)',
          textAlign: 'center', lineHeight: 1.5,
        }}>
          「{data.wisdomChinese}」
        </span>
        <div style={{ height: 12 }} />
        <span style={{
          fontFamily: 'var(--geist)', fontWeight: 400,
          fontSize: 13, fontStyle: 'italic',
          color: 'var(--secondary)', textAlign: 'center', lineHeight: 1.6,
        }}>
          {data.wisdomPinyin}
        </span>
        <div style={{ height: 12 }} />
        <span style={{
          fontFamily: 'var(--geist)', fontWeight: 400,
          fontSize: 15, color: 'var(--brown-mid)',
          textAlign: 'center', lineHeight: 1.6,
        }}>
          {data.wisdomEnglish}
        </span>
        <div style={{ height: 10 }} />
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          {data.wisdomAuthor && (
            <>
              <span style={{
                fontFamily: 'var(--geist)', fontWeight: 500,
                fontSize: 13, color: 'var(--secondary)',
              }}>
                — {data.wisdomAuthor}
              </span>
              <div style={{ height: 2 }} />
            </>
          )}
          <span style={{
            fontFamily: 'var(--geist)', fontWeight: 400,
            fontSize: 11, fontStyle: 'italic',
            color: 'rgba(87,74,59,0.7)',
          }}>
            {data.wisdomAuthor ? data.wisdomSource : `— ${data.wisdomSource}`}
          </span>
        </div>

        {/* ── Divider ── */}
        <div style={{ height: 28 }} />
        <HDivider />
        <div style={{ height: 28 }} />

        {/* ── 宜 ── */}
        {data.yi.length > 0 && (
          <>
            <YiJiSection
              label="宜"
              labelEn="AUSPICIOUS · DO"
              items={data.yi}
              accentColor="var(--deep-green)"
            />
            <div style={{ height: 20 }} />
          </>
        )}

        {/* ── 忌 ── */}
        {data.ji.length > 0 && (
          <YiJiSection
            label="忌"
            labelEn="INAUSPICIOUS · AVOID"
            items={data.ji}
            accentColor="var(--deep-red)"
          />
        )}

        {/* ── Footer ── */}
        <div style={{ height: 44 }} />
        <HDivider />
        <div style={{ height: 18 }} />
        <span style={{
          fontFamily: 'var(--fraunces)', fontWeight: 400,
          fontSize: 12, letterSpacing: '0.25em',
          color: 'var(--secondary)',
        }}>
          通勝日曆
        </span>
        <div style={{ height: 4 }} />
        <span style={{
          fontFamily: 'var(--geist)', fontWeight: 400,
          fontSize: 12, color: 'rgba(87,74,59,0.6)',
          textAlign: 'center',
        }}>
          在 Safari 中點擊「分享」→「加入主畫面」
        </span>
        <div style={{ height: 24 }} />

      </div>
    </div>
  );
}
