interface Props {
  forward?: boolean;
  onClick: () => void;
}

export function NavArrow({ forward = false, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      style={{
        width: 44, height: 44,
        borderRadius: 22,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
        WebkitTapHighlightColor: 'transparent',
      }}
      aria-label={forward ? 'Next' : 'Previous'}
    >
      <svg
        width="26" height="26" viewBox="0 0 24 24" fill="none"
        style={{ transform: forward ? 'rotate(-90deg)' : 'rotate(90deg)' }}
      >
        <path d="M7 10l5 5 5-5" stroke="var(--secondary)" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
