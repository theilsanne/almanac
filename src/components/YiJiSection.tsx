interface Props {
  label:       string;
  labelEn:     string;
  items:       string[];
  accentColor: string;
}

export function YiJiSection({ label, labelEn, items, accentColor }: Props) {
  const rows: string[][] = [];
  for (let i = 0; i < items.length; i += 4) rows.push(items.slice(i, i + 4));

  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{
          background: accentColor, borderRadius: 8,
          padding: '7px 12px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{
            fontFamily: 'var(--geist)', fontWeight: 600,
            fontSize: 20, color: '#fff', lineHeight: 1,
          }}>
            {label}
          </span>
        </div>
        <span style={{
          marginLeft: 12,
          fontFamily: 'var(--geist)', fontWeight: 500,
          fontSize: 12, letterSpacing: '0.1em',
          color: accentColor,
        }}>
          {labelEn}
        </span>
      </div>

      <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {rows.map((row, ri) => (
          <div key={ri} style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {row.map((item) => (
              <div key={item} style={{
                background: accentColor + '17',
                borderRadius: 6,
                padding: '6px 12px',
              }}>
                <span style={{
                  fontFamily: 'var(--geist)', fontWeight: 400,
                  fontSize: 15, color: 'var(--brown-mid)',
                }}>
                  {item}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
