// Marketing home page. `L` is the Laura component namespace; `root` is the path to the project root.
export function Home({ L, root = '../../' }) {
  const { Card, QuoteFact, StatusLabel, Checklist, StatLine } = L;
  const display = (size) => ({ font: '700 ' + size + 'px/0.98 var(--font-sans)', letterSpacing: 'var(--tracking-display)', textWrap: 'balance' });
  const label = { font: 'var(--text-meta-font)', fontWeight: 700 };
  const big = { font: '700 64px/1 var(--font-sans)', letterSpacing: '-.055em', marginTop: 10, whiteSpace: 'nowrap' };
  const arrivals = [
    { title: 'Tablet taken · 09:32', quote: "There. I've swallowed it.", inset: 280 },
    { title: 'Reading noted · 138/82 · 09:34', quote: 'One thirty-eight over eighty-two.', inset: 140 },
    { title: 'Errand added · Tea · just now', quote: "I'm nearly out of tea. Two bags left.", inset: 0, isNew: true },
  ];
  const steps = [
    ['Greets her by name', 'And remembers what she said yesterday.'],
    ['Asks how she is', 'How she slept, how the leg feels.'],
    ['Waits for the tablets', 'Stays on the line while she takes them.'],
    ['Notes the reading', 'Writes down her blood pressure as she reads it out.'],
    ["Asks what's missing", 'Anything running out goes on your list.'],
  ];
  const col = { flex: '1 1 240px', minWidth: 0 };
  return (
    <div style={{ padding: '0 24px 8px', maxWidth: 1760, margin: '0 auto', boxSizing: 'border-box' }}>
      <header style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px 40px', padding: '22px 20px' }}>
        <div style={{ font: '700 var(--size-wordmark)/1 var(--font-sans)', letterSpacing: '-.04em' }}>Laura</div>
        <div style={{ flex: 1 }} />
        <nav style={{ display: 'flex', gap: 36, whiteSpace: 'nowrap' }}><span>How a call goes</span><span>For families</span><span>About</span></nav>
        <a href="../dashboard/index.html" style={{ padding: '13px 26px', borderRadius: 'var(--radius-pill)', background: 'var(--ink)', color: 'var(--paper)', font: 'var(--text-label)', textDecoration: 'none', whiteSpace: 'nowrap' }}>Call now</a>
      </header>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--gap-cards)' }}>
        <Card tone="live" style={{ flex: '1 1 380px', minWidth: 0, padding: '36px 40px 30px', display: 'flex', flexDirection: 'column' }}>
          <div style={label}>Lidia's side · her own phone</div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px 0' }}>
            <img src={root + 'assets/phone.svg'} alt="A plain mobile phone with a smiling face on its screen" style={{ height: 570, maxHeight: '60vh', maxWidth: '100%' }} />
          </div>
          <div>Laura calls every morning at 09:30. No screen to learn, nothing to install.</div>
        </Card>

        <div style={{ flex: '2.2 1 600px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 'var(--gap-cards)' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--gap-cards)', flex: 1 }}>
            <div style={{ flex: '2 1 380px', minWidth: 0, padding: '18px 12px 0 24px' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10, ...label, padding: '8px 16px', borderRadius: 'var(--radius-pill)', background: 'var(--surface-quiet)' }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--accent)' }} />Lidia, 94 · on the phone now
              </span>
              <h1 style={{ ...display(72), margin: '24px 0 0' }}>Laura called this morning. Here is how she is.</h1>
              <p style={{ margin: '22px 0 0', maxWidth: 460, color: 'var(--text-secondary)', lineHeight: 1.4 }}>A daily phone call for your mother or grandmother, and a page for you that fills in as she speaks.</p>
            </div>
            <Card tone="quiet" style={{ flex: '1 1 280px', minWidth: 0, padding: '32px 30px', display: 'flex', flexDirection: 'column' }}>
              <div style={label}>Today, in her words</div>
              <div style={{ font: '700 var(--size-reading)/1.03 var(--font-sans)', letterSpacing: 'var(--tracking-reading)', marginTop: 14 }}>“I'm all right. A bit tired, but all right.”</div>
              <div style={{ flex: 1, minHeight: 20 }} />
              <div style={label}>Sleep</div>
              <div style={{ marginTop: 2 }}>“I woke at four and couldn't get back off.”</div>
            </Card>
          </div>
          <Card style={{ padding: '32px 36px', display: 'flex', flexWrap: 'wrap', gap: '28px 48px' }}>
            <div style={{ flex: '1.2 1 280px', minWidth: 0 }}>
              <div style={label}>Tablets</div>
              <div style={big}>3 of 4</div>
              <div style={{ marginTop: 16 }}>
                <QuoteFact fact="Metoprolol" status={<StatusLabel status="taken" />} />
                <QuoteFact fact="Ramipril" status={<StatusLabel status="taken" />} />
                <QuoteFact fact="Furosemide" status={<StatusLabel status="earlier" />} />
                <QuoteFact muted fact="Atorvastatin" status={<StatusLabel status="not-confirmed" />} style={{ paddingBottom: 0 }} />
              </div>
            </div>
            <div style={col}>
              <div style={label}>Blood pressure</div>
              <div style={big}>138/82</div>
              <div style={{ marginTop: 16 }}>“One thirty-eight over eighty-two. I wrote it down.”</div>
            </div>
            <div style={col}>
              <div style={label}>Errands</div>
              <div style={big}>2</div>
              <Card tone="action" compact style={{ padding: '4px 18px 6px', marginTop: 16, borderRadius: 18, overflow: 'hidden' }}>
                <Checklist items={[{ label: 'Tea', quote: "I'm nearly out of tea. Two bags left.", meta: 'Just now', isNew: true }]} style={{ marginTop: -5 }} />
              </Card>
              <Checklist onHighlight={false} items={[{ label: 'Hearing-aid batteries' }]} style={{ padding: '0 18px' }} />
            </div>
          </Card>
        </div>
      </div>

      <Card tone="quiet" style={{ marginTop: 'var(--gap-cards)', padding: '40px 0 44px 56px', display: 'flex', flexWrap: 'wrap', gap: 44, overflow: 'hidden' }}>
        <div style={{ flex: '1 1 340px', maxWidth: 420, paddingRight: 24 }}>
          <h2 style={{ ...display(64), margin: 0 }}>While they talk, the page fills in.</h2>
          <p style={{ margin: '22px 0 0', lineHeight: 1.4 }}>Each thing she says arrives as a card with her own words on it.</p>
        </div>
        <div style={{ flex: '2 1 520px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {arrivals.map((a) => (
            <div key={a.title} style={{ display: 'flex', alignItems: 'center', gap: 16, marginLeft: 'min(' + a.inset + 'px, ' + a.inset / 14 + 'vw)' }}>
              <div aria-hidden="true" style={{ display: 'flex', flexDirection: 'column', gap: 9, alignItems: 'flex-end', flex: 'none' }}>
                {[110, 70, 130].map((w) => <span key={w} style={{ width: w, height: 2, borderRadius: 1, background: 'var(--accent)' }} />)}
              </div>
              <div style={{ flex: 1, background: a.isNew ? 'var(--surface-action)' : 'var(--surface-card)', borderRadius: '22px 0 0 22px', padding: '20px 28px 22px' }}>
                <div style={label}>{a.title}</div>
                <div style={{ font: '700 var(--size-reading)/1.05 var(--font-sans)', letterSpacing: 'var(--tracking-reading)', marginTop: 4 }}>{'\u201C' + a.quote + '\u201D'}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--gap-cards)', marginTop: 'var(--gap-cards)' }}>
        <Card style={{ flex: '1 1 380px', minWidth: 0, padding: '40px 42px 44px' }}>
          <div style={label}>Last two weeks</div>
          <div style={{ font: '700 80px/0.95 var(--font-sans)', letterSpacing: '-.06em', marginTop: 8, whiteSpace: 'nowrap' }}>39 of 42</div>
          <div style={{ marginTop: 10 }}>tablets confirmed on the call</div>
          <div role="img" aria-label="39 of 42 dots filled" style={{ display: 'grid', gridTemplateColumns: 'repeat(14,1fr)', gap: 8, marginTop: 30 }}>
            {Array.from({ length: 42 }, (_, i) => (
              <span key={i} style={{ aspectRatio: '1', borderRadius: '50%', boxSizing: 'border-box', ...(i < 39 ? { background: 'var(--accent)' } : { border: '2px solid var(--accent)' }) }} />
            ))}
          </div>
        </Card>
        <Card style={{ flex: '2.2 1 600px', minWidth: 0, padding: '40px 44px 44px' }}>
          <h2 style={{ ...display(64), margin: 0 }}>How a call goes</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '28px 22px', marginTop: 40 }}>
            {steps.map(([t, d], i) => (
              <div key={t} style={{ flex: '1 1 150px', minWidth: 0 }}>
                <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--accent)', color: 'var(--paper)', font: '700 24px/52px var(--font-sans)', textAlign: 'center' }}>{i + 1}</div>
                <div style={{ fontWeight: 700, lineHeight: 1.15, marginTop: 16 }}>{t}</div>
                <div style={{ marginTop: 6, color: 'var(--text-secondary)' }}>{d}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <footer style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'baseline', gap: '8px 32px', padding: '26px 20px 24px' }}>
        <b>About</b>
        <span style={{ color: 'var(--text-secondary)' }}>Laura reminds and records. She never gives medical advice.</span>
      </footer>
    </div>
  );
}
