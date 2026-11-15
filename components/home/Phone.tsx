// The home page's one illustration: her cordless home phone standing in its charging stand, drawn here (not as an
// image file) so its parts can move. When the page loads the screen is blank; then Laura's call arrives: her name and
// the time appear on the screen and the handset rocks twice in the stand. Once, and not at all with reduced motion
// (app/globals.css: laura-phone-*).
const ink = "#2b211d", cream = "#fbf6ec";
const font = "Helvetica Neue,Helvetica,Arial,sans-serif";
const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"];

export function Phone({ style }: { style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 320 408" role="img" aria-label="A cordless home phone standing in its charging stand, with Laura calling at 09:30" style={style}>
      <ellipse cx="168" cy="394" rx="122" ry="8" fill="rgba(43,33,29,.2)" />
      <path d="M262 336 c26 0 30 18 50 34" fill="none" stroke={ink} strokeWidth="3" strokeLinecap="round" />
      <rect x="72" y="272" width="194" height="100" rx="30" fill="#eadfca" stroke={ink} strokeWidth="3" />
      <rect x="100" y="284" width="138" height="60" rx="20" fill="#d9ccb2" stroke={ink} strokeWidth="2" />
      <path d="M84 304 v34 M254 304 v34" fill="none" stroke={ink} strokeWidth="2" strokeLinecap="round" />
      {/* The handset, leaning in the stand; the inner group is what rocks, about its foot. */}
      <g transform="rotate(-8 150 200)">
        <g className="laura-phone-handset">
          <rect x="96" y="24" width="108" height="320" rx="40" fill="#6e2233" stroke={ink} strokeWidth="3" />
          <rect x="132" y="42" width="36" height="7" rx="3.5" fill={cream} />
          <rect x="112" y="60" width="76" height="66" rx="10" fill={cream} stroke={ink} strokeWidth="2.5" />
          <text className="laura-phone-name" x="150" y="87" fontFamily={font} fontWeight="700" textAnchor="middle" fontSize="15" fill={ink}>Laura</text>
          <text className="laura-phone-time" x="150" y="111" fontFamily={font} fontWeight="700" textAnchor="middle" fontSize="19" fill={ink}>09:30</text>
          <rect x="108" y="140" width="28" height="18" rx="9" fill="#e4c463" stroke={ink} strokeWidth="2" />
          <path d="M116 152 q6 -7 12 0" fill="none" stroke={ink} strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="150" cy="149" r="12" fill={cream} stroke={ink} strokeWidth="2" />
          <circle cx="150" cy="149" r="4" fill={ink} />
          <rect x="164" y="140" width="28" height="18" rx="9" fill="#eadfca" stroke={ink} strokeWidth="2" />
          <path d="M172 146 q6 7 12 0" fill="none" stroke={ink} strokeWidth="2.5" strokeLinecap="round" />
          {KEYS.map((key, i) => {
            const x = 113 + (i % 3) * 26, y = 179 + Math.floor(i / 3) * 29;
            return (
              <g key={key}>
                <rect x={x} y={y} width="22" height="22" rx="8" fill={cream} stroke={ink} strokeWidth="2" />
                <text x={x + 11} y={y + 16} fontFamily={font} fontWeight="700" textAnchor="middle" fontSize="13" fill={ink}>{key}</text>
              </g>
            );
          })}
          <circle cx="141" cy="304" r="2.2" fill={cream} />
          <circle cx="150" cy="304" r="2.2" fill={cream} />
          <circle cx="159" cy="304" r="2.2" fill={cream} />
        </g>
      </g>
      <rect x="80" y="380" width="30" height="7" rx="3.5" fill={ink} />
      <rect x="230" y="380" width="30" height="7" rx="3.5" fill={ink} />
      <rect x="54" y="322" width="232" height="60" rx="26" fill={cream} stroke={ink} strokeWidth="3" />
      <path d="M82 334 h176" fill="none" stroke="#d9ccb2" strokeWidth="3" strokeLinecap="round" />
      <path d="M76 346 h26 M76 354 h26 M76 362 h26" fill="none" stroke={ink} strokeWidth="2.5" strokeLinecap="round" />
      <rect x="116" y="343" width="32" height="22" rx="9" fill="#eadfca" stroke={ink} strokeWidth="2" />
      <path d="M126 354 h12" fill="none" stroke={ink} strokeWidth="2.5" strokeLinecap="round" />
      <rect x="154" y="343" width="32" height="22" rx="9" fill="#eadfca" stroke={ink} strokeWidth="2" />
      <path d="M164 354 h12 M170 348 v12" fill="none" stroke={ink} strokeWidth="2.5" strokeLinecap="round" />
      <rect x="194" y="343" width="40" height="22" rx="11" fill="#eadfca" stroke={ink} strokeWidth="2" />
      <path d="M206 359 a7 7 0 0 1 0 -10 M222 359 a7 7 0 0 0 0 -10" fill="none" stroke={ink} strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="214" cy="354" r="2.6" fill={ink} />
      <circle cx="258" cy="354" r="7" fill="#e4c463" stroke={ink} strokeWidth="2" />
    </svg>
  );
}
