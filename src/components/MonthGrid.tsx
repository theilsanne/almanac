import { useCallback, useMemo } from 'react';
import { getMonthGridData } from '../lib/lunarCalendar';

const DOW_LABELS = ['MON','TUE','WED','THU','FRI','SAT','SUN'];

interface Props {
  gridYear:      number;
  gridMonth:     number;
  selectedYear:  number;
  selectedMonth: number;
  selectedDay:   number;
  todayYear:     number;
  todayMonth:    number;
  todayDay:      number;
  onDaySelected: (date: Date) => void;
}

export function MonthGrid({
  gridYear, gridMonth,
  selectedYear, selectedMonth, selectedDay,
  todayYear, todayMonth, todayDay,
  onDaySelected,
}: Props) {
  const { offset, days } = useMemo(
    () => getMonthGridData(gridYear, gridMonth),
    [gridYear, gridMonth],
  );

  const cells = useMemo(() => {
    const blanks: null[] = Array(offset).fill(null);
    return [...blanks, ...days];
  }, [offset, days]);

  const rows: typeof cells[] = [];
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));

  const handleClick = useCallback((day: number) => {
    onDaySelected(new Date(gridYear, gridMonth - 1, day, 12, 0, 0));
  }, [gridYear, gridMonth, onDaySelected]);

  return (
    <div style={{ width: '100%' }}>
      {/* Day-of-week header */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
        {DOW_LABELS.map((d) => (
          <div key={d} style={{ textAlign: 'center', paddingBottom: 4 }}>
            <span style={{
              fontFamily: 'var(--geist)', fontWeight: 500,
              fontSize: 8, letterSpacing: '0.05em',
              color: 'rgba(87,74,59,0.55)',
            }}>
              {d}
            </span>
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {rows.map((row, ri) => (
          <div key={ri} style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
            {Array(7).fill(null).map((_, ci) => {
              const cell = row[ci];
              if (!cell) return <div key={ci} style={{ height: 52 }} />;

              const isToday    = gridYear === todayYear  && gridMonth === todayMonth  && cell.dayNum === todayDay;
              const isSelected = gridYear === selectedYear && gridMonth === selectedMonth && cell.dayNum === selectedDay && !isToday;

              return (
                <button
                  key={ci}
                  onClick={() => handleClick(cell.dayNum)}
                  style={{
                    height: 52,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    position: 'relative',
                    WebkitTapHighlightColor: 'transparent',
                  }}
                  aria-label={`${gridMonth}月${cell.dayNum}日`}
                >
                  {(isToday || isSelected) && (
                    <div style={{
                      position: 'absolute',
                      inset: '2px 3px',
                      borderRadius: 10,
                      background: isToday ? 'var(--ink)' : 'rgba(87,74,59,0.10)',
                    }} />
                  )}
                  <div style={{
                    position: 'relative',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', gap: 2,
                  }}>
                    {/* Solar term dot */}
                    <div style={{ height: 6, display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}>
                      {cell.solarTerm && (
                        <div style={{
                          width: 4, height: 4, borderRadius: '50%',
                          background: isToday ? 'rgba(242,234,214,0.7)' : 'var(--deep-red)',
                        }} />
                      )}
                    </div>
                    <span style={{
                      fontFamily: 'var(--fraunces)', fontWeight: 300,
                      fontSize: 15,
                      color: isToday ? 'var(--paper)' : 'var(--ink)',
                      lineHeight: 1,
                    }}>
                      {cell.dayNum}
                    </span>
                    <span style={{
                      fontFamily: 'var(--geist)', fontWeight: 400,
                      fontSize: 7,
                      color: isToday ? 'rgba(242,234,214,0.75)' : 'rgba(87,74,59,0.75)',
                      lineHeight: 1,
                    }}>
                      {cell.lunarDay}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
