// Marketing home page, told as a story: what Laura is, one morning step by step, then what it adds up to.
// `L` is the Laura component namespace; `root` is the path to the project root.
// The story as a short film: press play and the call unfolds. A caption sets the scene, the two speech
// bubbles appear in turn, and each thing Lidia says lands on Paul's page on the right, which fills up.
function Story({ beats, ending, styles }) {
  const { label, lead, reading } = styles;
  const BEAT = 7, END = 6, T = beats.length * BEAT + END;
  const [t, setT] = React.useState(0);
  const [playing, setPlaying] = React.useState(false);
  const [started, setStarted] = React.useState(false);
  React.useEffect(() => {
    if (!playing) return undefined;
    const id = setInterval(() => setT((v) => Math.min(v + 0.1, T)), 100);
    return () => clearInterval(id);
  }, [playing]);
  React.useEffect(() => { if (t >= T) setPlaying(false); }, [t]);

  const play = () => { if (t >= T) setT(0); setStarted(true); setPlaying(true); };
  const seek = (e) => { const r = e.currentTarget.getBoundingClientRect(); setT(Math.max(0, Math.min(T, ((e.clientX - r.left) / r.width) * T))); setStarted(true); };
  const n = Math.min(Math.floor(t / BEAT), beats.length);
  const local = t - n * BEAT;
  const b = beats[n];
  const done = t >= T;
  const arrive = { animation: 'laura-arrive 500ms cubic-bezier(.2,.7,.2,1) both' };
  const clock = (s) => '0:' + String(Math.floor(s)).padStart(2, '0');
  const round = { width: 52, height: 52, borderRadius: '50%', border: 0, background: 'var(--surface-card)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none', padding: 0 };
  const triangle = (size) => <span aria-hidden="true" style={{ width: 0, height: 0, borderStyle: 'solid', borderWidth: size + 'px 0 ' + size + 'px ' + size * 1.6 + 'px', borderColor: 'transparent transparent transparent var(--accent)', marginLeft: size * 0.4 }} />;
  const bars = <span aria-hidden="true" style={{ display: 'flex', gap: 6 }}><span style={{ width: 6, height: 20, background: 'var(--accent)' }} /><span style={{ width: 6, height: 20, background: 'var(--accent)' }} /></span>;

  return (
    <div style={{ marginTop: 36, position: 'relative', background: 'var(--surface-live)', color: 'var(--text-on-live)', borderRadius: 'var(--radius-card)', overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 'clamp(620px, 48vw, 800px)' }}>
      <div style={{ flex: 1, display: 'flex', flexWrap: 'wrap', gap: '28px 48px', padding: '40px 44px 28px' }}>
        <div style={{ flex: '1.5 1 420px', minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <div key={'cap' + n} style={arrive}>
            <div style={label}>{b ? b.time : ending.time}</div>
            <div style={{ ...reading, marginTop: 8, maxWidth: 720, textWrap: 'balance' }}>{b ? b.say : ending.say}</div>
          </div>
          <div style={{ flex: 1, minHeight: 28 }} />
          <div key={'talk' + n} style={{ display: 'flex', flexDirection: 'column', gap: 12, minHeight: 200, justifyContent: 'flex-end' }}>
            {b && local >= 0.9 ? (
              <div style={{ alignSelf: 'flex-start', maxWidth: '84%', background: 'var(--surface-quiet)', color: 'var(--ink)', borderRadius: '24px 24px 24px 6px', padding: '14px 24px 16px', ...arrive }}>
                <div style={label}>Laura</div>
                <div style={{ fontSize: 22, lineHeight: 1.35, marginTop: 2 }}>{b.laura}</div>
              </div>
            ) : null}
            {b && local >= 2.6 ? (
              <div style={{ alignSelf: 'flex-end', maxWidth: '84%', background: 'var(--surface-card)', color: 'var(--ink)', borderRadius: '24px 24px 6px 24px', padding: '14px 24px 18px', ...arrive }}>
                <div style={label}>Lidia</div>
                <div style={{ ...lead, marginTop: 4 }}>{'\u201C' + b.lidia + '\u201D'}</div>
              </div>
            ) : null}
            {!b && done ? (
              <a href="../dashboard/index.html" style={{ alignSelf: 'flex-start', padding: '13px 26px', borderRadius: 'var(--radius-pill)', background: 'var(--accent)', color: 'var(--text-on-accent)', font: 'var(--text-label)', textDecoration: 'none', ...arrive }}>See his page</a>
            ) : null}
          </div>
        </div>
        <div style={{ flex: '1 1 300px', minWidth: 0, maxWidth: 440, background: 'var(--surface-page)', color: 'var(--ink)', borderRadius: 24, padding: '22px 22px 24px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '0 6px 6px' }}>
            <span style={label}>Paul's page</span>
            <span style={{ font: 'var(--text-meta-font)', color: 'var(--text-meta)' }}>{t < T - END ? 'Call in progress' : 'Called at 09:30'}</span>
          </div>
          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {beats.map((x, i) => {
              const shown = t >= i * BEAT + 4.2;
              // Always rendered so the frame keeps its final height; hidden until its moment.
              return (
                <div key={x.time + (shown ? '-on' : '-off')} aria-hidden={!shown} style={{ background: x.card.action ? 'var(--surface-action)' : 'var(--surface-card)', borderRadius: 16, padding: '14px 18px 16px', ...(shown ? arrive : { visibility: 'hidden' }) }}>
                  <div style={{ ...label, color: x.card.action ? 'inherit' : 'var(--text-question)' }}>{x.card.label}</div>
                  <div style={{ marginTop: 4 }}>{x.card.body}</div>
                </div>
              );
            })}
            {t < 4.2 ? <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '6px', color: 'var(--text-meta)' }}>Nothing yet. It fills in as she speaks.</div> : null}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 18, padding: '0 44px 30px' }}>
        <button type="button" aria-label={playing ? 'Pause' : 'Play'} style={round} onClick={() => (playing ? setPlaying(false) : play())}>{playing ? bars : triangle(9)}</button>
        <div role="slider" tabIndex={0} aria-label="Position in the story" aria-valuemin={0} aria-valuemax={T} aria-valuenow={Math.round(t)} onClick={seek}
          onKeyDown={(e) => { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); setStarted(true); setT((v) => Math.max(0, Math.min(T, v + (e.key === 'ArrowRight' ? 2 : -2)))); } }} style={{ flex: 1, height: 44, display: 'flex', alignItems: 'center', cursor: 'pointer', position: 'relative' }}>
          <div style={{ width: '100%', height: 6, borderRadius: 3, background: 'rgba(43,33,29,.22)', position: 'relative' }}>
            <div style={{ width: (t / T) * 100 + '%', height: '100%', borderRadius: 3, background: 'var(--ink)' }} />
            {beats.map((x, i) => (i ? <span key={i} style={{ position: 'absolute', left: ((i * BEAT) / T) * 100 + '%', top: -3, width: 2, height: 12, background: 'var(--surface-live)' }} /> : null))}
            <span style={{ position: 'absolute', left: ((beats.length * BEAT) / T) * 100 + '%', top: -3, width: 2, height: 12, background: 'var(--surface-live)' }} />
          </div>
        </div>
        <span style={{ font: 'var(--text-meta-font)', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>{clock(t)} / {clock(T)}</span>
      </div>

      {!started ? (
        <button type="button" onClick={play} aria-label="Play the story" style={{ position: 'absolute', inset: 0, border: 0, background: 'var(--surface-live)', color: 'var(--text-on-live)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 28, padding: 24 }}>
          <span style={{ ...round, width: 112, height: 112 }}>{triangle(18)}</span>
          <span style={{ ...reading, textWrap: 'balance', maxWidth: 640 }}>Watch the call. It takes {T} seconds.</span>
          <span style={{ font: 'var(--text-body)' }}>What Laura says, what Lidia answers, and what Paul sees.</span>
        </button>
      ) : null}
    </div>
  );
}

export function Home({ L, root = '../../' }) {
  const { Card, StatusLabel } = L;
  const display = (size) => ({ font: '700 ' + size + 'px/0.98 var(--font-sans)', letterSpacing: 'var(--tracking-display)', textWrap: 'balance', margin: 0 });
  const label = { font: 'var(--text-meta-font)', fontWeight: 700 };
  const lead = { font: '700 var(--size-lead)/var(--leading-lead) var(--font-sans)', letterSpacing: 'var(--tracking-lead)' };
  const reading = { font: '700 var(--size-reading)/1.03 var(--font-sans)', letterSpacing: 'var(--tracking-reading)' };
  const q = (s) => '\u201C' + s + '\u201D';
  const title = { font: '700 30px/1.1 var(--font-sans)', letterSpacing: '-.03em' };
  const box = { width: 24, height: 24, border: '2px solid var(--ink)', background: 'var(--surface-card)', borderRadius: 7, flex: 'none', boxSizing: 'border-box' };
  const TABLETS = ['Concor', 'Ramipril', 'Furosemide', 'Atorvastatin'];
  const NEXT = { none: 'taken', taken: 'earlier', earlier: 'none' };
  const MARK = {
    taken: { label: 'Taken on call', mark: { background: 'var(--accent)', border: '2px solid var(--accent)' }, tick: 'var(--text-on-accent)' },
    earlier: { label: 'Says taken earlier', mark: { border: '2px solid var(--accent)' }, tick: 'var(--accent)' },
    none: { label: 'Not confirmed', mark: { border: '2px dashed var(--ink-3)' }, tick: null },
  };
  const [tabs, setTabs] = React.useState(['taken', 'taken', 'earlier', 'none']);
  const takenCount = tabs.filter((s) => s !== 'none').length;

  const story = [
    { time: '09:30', say: 'At half past nine the phone rings. Lidia picks up.', laura: 'Good morning, Lidia. How did you sleep?', lidia: "I woke at four and couldn't get back off. Otherwise fine.",
      card: { label: 'Sleep', body: q("I woke at four and couldn't get back off. Otherwise fine.") } },
    { time: '09:32', say: 'Laura reminds her about the morning tablets, and stays on the line while she takes them.', laura: "Take them now, take your time, I'll wait.", lidia: "There. I've swallowed it.",
      card: { label: 'Tablets', body: <span style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '4px 12px' }}><b>Concor 50 mg</b><StatusLabel status="taken" /></span> } },
    { time: '09:34', say: 'Then the blood pressure. Lidia reads the numbers off her monitor.', laura: 'What does your blood pressure say this morning?', lidia: 'One thirty-eight over eighty-two. I wrote it down.',
      card: { label: 'Blood pressure', body: <span style={lead}>138/82</span> } },
    { time: '09:35', say: 'Before they say goodbye, Laura asks about the cupboards.', laura: 'Is anything running out at home?', lidia: "I'm nearly out of tea. Two bags left.",
      card: { action: true, label: 'For Paul to bring', body: <span style={lead}>Tea</span> } },
  ];
  const ending = { time: '09:36', say: 'Six minutes. Lidia goes back to her morning. Paul opens the page and knows how she is.' };
  const jobs = [
    ['Makes sure nothing is missed', ['Her tablets, taken while Laura waits on the line', 'Anything running out at home, passed on to you']],
    ['Keeps a record of how she is', ['How she feels today, in her own words', 'How she slept', 'Her left leg, day by day', 'Her blood pressure, as she reads it out']],
  ];

  return (
    <div style={{ padding: '0 24px 8px', maxWidth: 1760, margin: '0 auto', boxSizing: 'border-box' }}>
      <header style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px 40px', padding: '26px 20px 22px' }}>
        <div style={{ font: '700 var(--size-wordmark-large)/1 var(--font-sans)', letterSpacing: '-.06em' }}>laura</div>
        <div style={{ flex: 1 }} />
        <nav style={{ display: 'flex', gap: 36, whiteSpace: 'nowrap' }}><span>One morning</span><span>What Laura does</span><span>About</span></nav>
        <a href="../dashboard/index.html" style={{ padding: '13px 26px', borderRadius: 'var(--radius-pill)', background: 'var(--accent)', color: 'var(--text-on-accent)', font: 'var(--text-label)', textDecoration: 'none', whiteSpace: 'nowrap' }}>Call now</a>
      </header>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--gap-cards)' }}>
        <Card tone="live" style={{ flex: '1 1 380px', minWidth: 0, padding: '36px 40px 30px', display: 'flex', flexDirection: 'column' }}>
          <div style={label}>Her side · the phone she already has</div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px 0' }}>
            <img src={root + 'assets/home-phone.svg'} alt="A cordless home phone standing in its charging stand" style={{ height: 500, maxHeight: '60vh', maxWidth: '100%' }} />
          </div>
          <div>
            <div style={lead}>No smartphone needed.</div>
            <div style={{ marginTop: 8 }}>Most people her age don't have one. Laura rings the phone that's already in the house, a landline or a simple mobile, and she just answers.</div>
          </div>
        </Card>

        <div style={{ flex: '2.2 1 600px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 'var(--gap-cards)' }}>
          <div style={{ flex: 1, display: 'flex', flexWrap: 'wrap', gap: 'var(--gap-cards)' }}>
            <div style={{ flex: '2 1 420px', minWidth: 0, padding: '14px 12px 24px 24px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10, ...label, padding: '8px 16px', borderRadius: 'var(--radius-pill)', background: 'var(--surface-quiet)' }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--accent)', flex: 'none' }} />
                <span>Lidia, 94 · on the phone now</span>
              </span>
              <h1 style={{ ...display(60), marginTop: 22, maxWidth: 760 }}>Laura phones her every morning, so nothing gets missed.</h1>
              <p style={{ margin: '20px 0 0', maxWidth: 520, lineHeight: 1.4, color: 'var(--text-secondary)' }}>A daily phone call for your mother or grandmother, and a page for you that fills in as she speaks.</p>
            </div>
            <Card tone="quiet" style={{ flex: '1 1 300px', minWidth: 0, padding: 30, display: 'flex', flexDirection: 'column' }}>
              <div style={{ ...label, color: 'var(--text-question)' }}>Today, in her words</div>
              <div style={{ ...reading, marginTop: 14 }}>{q("I'm all right. A bit tired, but all right.")}</div>
              <div style={{ flex: 1, minHeight: 16 }} />
              <div style={label}>Sleep</div>
              <div style={{ marginTop: 2 }}>{q("I woke at four and couldn't get back off.")}</div>
            </Card>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--gap-cards)' }}>
            <Card style={{ flex: '1.2 1 320px', minWidth: 0, padding: '28px 30px 26px' }}>
              <div style={title}>Tablets</div>
              <div style={{ marginTop: 4, color: 'var(--text-secondary)' }}>{takenCount} of 4 taken today. Click one to change its mark.</div>
              <div style={{ marginTop: 16 }}>
                {TABLETS.map((name, i) => {
                  const m = MARK[tabs[i]];
                  return (
                    <button key={name} type="button" onClick={() => setTabs((t) => t.map((v, j) => (j === i ? NEXT[v] : v)))}
                      style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', minHeight: 46, padding: 0, border: 0, borderTop: '1px solid var(--rule)', background: 'none', font: 'inherit', textAlign: 'left', cursor: 'pointer', color: m.tick ? 'var(--text-primary)' : 'var(--text-meta)' }}>
                      <span style={{ width: 30, height: 30, borderRadius: '50%', flex: 'none', boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 240ms, border-color 240ms', ...m.mark }}>
                        {m.tick ? <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M3 8.5 L6.6 12 L13 4.5" style={{ fill: 'none', stroke: m.tick, strokeWidth: 2.4, strokeLinecap: 'round', strokeLinejoin: 'round' }} /></svg> : null}
                      </span>
                      <b style={{ flex: 1 }}>{name}</b>
                      <span style={{ font: 'var(--text-meta-font)', whiteSpace: 'nowrap' }}>{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </Card>
            <Card tone="quiet" style={{ flex: '1 1 280px', minWidth: 0, padding: '28px 30px 26px' }}>
              <div style={title}>Blood pressure</div>
              <div style={{ marginTop: 4, color: 'var(--text-secondary)' }}>She read it out on the call.</div>
              <div style={{ marginTop: 16 }}>{q('One thirty-eight over eighty-two. I wrote it down.')}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', marginTop: 14, fontVariantNumeric: 'tabular-nums' }}>
                {[['Today', '138/82'], ['Thu 12 Nov', '142/85'], ['Wed 11 Nov', '136/80']].map(([d, v], i) => (
                  <React.Fragment key={d}>
                    <span style={{ padding: '9px 0', borderTop: '1px solid var(--rule)', ...(i ? { color: 'var(--text-secondary)' } : { fontWeight: 700 }) }}>{d}</span>
                    <span style={{ padding: '9px 0', borderTop: '1px solid var(--rule)', fontWeight: i ? 400 : 700 }}>{v}</span>
                  </React.Fragment>
                ))}
              </div>
            </Card>
            <Card tone="action" style={{ flex: '1 1 280px', minWidth: 0, padding: '28px 30px 26px' }}>
              <div style={title}>To bring her</div>
              <div style={{ marginTop: 4 }}>2 things she's running out of.</div>
              <div style={{ marginTop: 16, borderTop: '1px solid var(--rule-on-highlight)', padding: '12px 0 14px' }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <span style={box} />
                  <b style={{ flex: 1 }}>Tea</b>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8, ...label, whiteSpace: 'nowrap' }}><span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--accent)' }} /><span>Just now</span></span>
                </div>
                <div style={{ margin: '8px 0 0 36px' }}>{q("I'm nearly out of tea. Two bags left.")}</div>
              </div>
              <div style={{ borderTop: '1px solid var(--rule-on-highlight)', padding: '12px 0 0', display: 'flex', gap: 12, alignItems: 'center' }}>
                <span style={box} />
                <b style={{ flex: 1 }}>Hearing-aid batteries</b>
                <span style={{ font: 'var(--text-meta-font)', whiteSpace: 'nowrap' }}>Wed</span>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <section style={{ marginTop: 88, padding: '0 20px' }}>
        <h2 style={display(64)}>One morning with Lidia</h2>
        <p style={{ margin: '18px 0 0', maxWidth: 680, fontSize: 22, lineHeight: 1.4, color: 'var(--text-secondary)' }}>Lidia is 94. Her grandson Paul looks after her from another city. This is Friday.</p>
      </section>
      <Story beats={story} ending={ending} styles={{ label, lead, reading }} />

      <section style={{ marginTop: 72, padding: '0 20px' }}>
        <h2 style={display(64)}>What it adds up to</h2>
      </section>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--gap-cards)', marginTop: 36 }}>
        <Card style={{ flex: '2.2 1 600px', minWidth: 0, padding: '40px 44px 44px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '36px 56px' }}>
            {jobs.map(([title, items]) => (
              <div key={title} style={{ flex: '1 1 300px', minWidth: 0 }}>
                <div style={reading}>{title}</div>
                <div style={{ marginTop: 22 }}>
                  {items.map((it) => (
                    <div key={it} style={{ display: 'flex', gap: 14, alignItems: 'baseline', padding: '13px 0', borderTop: '1px solid var(--rule)' }}>
                      <span style={{ width: 'var(--marker)', height: 'var(--marker)', borderRadius: '50%', background: 'var(--accent)', flex: 'none' }} />
                      <span>{it}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card tone="quiet" style={{ flex: '1 1 380px', minWidth: 0, padding: '40px 42px 44px' }}>
          <div style={label}>Day after day</div>
          <div style={{ font: '700 80px/0.95 var(--font-sans)', letterSpacing: '-.06em', marginTop: 8, whiteSpace: 'nowrap' }}>39 of 42</div>
          <div style={{ marginTop: 10 }}>of Lidia's tablets confirmed on the call in the last two weeks</div>
          <div role="img" aria-label="39 of 42 dots filled" style={{ display: 'grid', gridTemplateColumns: 'repeat(14,1fr)', gap: 8, marginTop: 30 }}>
            {Array.from({ length: 42 }, (_, i) => (
              <span key={i} style={{ aspectRatio: '1', borderRadius: '50%', boxSizing: 'border-box', ...(i < 39 ? { background: 'var(--accent)' } : { border: '2px solid var(--accent)' }) }} />
            ))}
          </div>
        </Card>
      </div>

      <footer style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'baseline', gap: '8px 32px', padding: '40px 20px 28px' }}>
        <b>About</b>
        <span style={{ color: 'var(--text-secondary)' }}>Laura reminds and records. She never gives medical advice and never interprets a reading.</span>
      </footer>
    </div>
  );
}
