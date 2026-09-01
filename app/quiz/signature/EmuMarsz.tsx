// Pytanie 3: piec emu maszeruje przez teczke, ostatnie niesie flage z wynikiem.
export default function EmuMarsz() {
  return (
    <span className="sig sig--emu" aria-hidden="true">
      <span className="sig__kolumna gif-less">
        {[0, 1, 2, 3, 4].map((i) => (
          <svg key={i} viewBox="0 0 24 32" className="sig__emu gif-less" style={{ animationDelay: `${(i * 137) % 900}ms` }}>
            <path d="M8 30 L10 18 M14 30 L12 18" />
            <path d="M6 18 A6 6 0 0 1 18 18 A6 6 0 0 1 6 18 Z" />
            <path d="M16 14 L18 6 L21 5" />
          </svg>
        ))}
        <span className="sig__flaga">EMU 1 : 0 ARMIA</span>
      </span>
    </span>
  );
}
