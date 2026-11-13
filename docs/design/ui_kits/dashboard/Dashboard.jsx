// The carer's page. `L` is the Laura component namespace.
// "Call now" plays a simulated call: items arrive every few seconds, or press → / Space to step.
export function Dashboard({ L }) {
  const { Card, AnswerCard, QuoteFact, StatusLabel, CallStatus, DatedList, Checklist, FeedItem, QuietRow, KeyValueRows, StatLine, DoseBars } = L;
  const EVENTS = [
    { t: '09:30', title: 'Call answered', quote: "Yes, hello, it's me." },
    { t: '09:31', title: 'Today', quote: "I'm all right. A bit tired, but all right.", set: { today: true } },
    { t: '09:31', title: 'Sleep', quote: "I woke at four and couldn't get back off. Otherwise fine.", set: { sleep: true } },
    { t: '09:31', title: 'Left leg', quote: "It's a little better today, less swollen than yesterday.", set: { leg: true } },
    { t: '09:32', title: 'Laura said', quote: "Take them now, take your time, I'll wait.", speaker: 'laura' },
    { t: '09:32', title: 'Metoprolol · Taken on call', quote: "There. I've swallowed it.", set: { met: 'taken' } },
    { t: '09:33', title: 'Ramipril · Taken on call', quote: 'And the small white one, yes.', set: { ram: 'taken' } },
    { t: '09:33', title: 'Furosemide · Says taken earlier', quote: 'That one I took with breakfast already.', set: { fur: 'earlier' } },
    { t: '09:34', title: 'Blood pressure · 138/82', quote: 'One thirty-eight over eighty-two. I wrote it down.', set: { bp: true } },
    { t: '09:34', title: 'Errand added · Tea', quote: "I'm nearly out of tea. Two bags left.", set: { tea: true } },
  ];
  const [n, setN] = React.useState(0);
  const [call, setCall] = React.useState('idle');
  const [secs, setSecs] = React.useState(0);
  const [ticked, setTicked] = React.useState({});
  const [open, setOpen] = React.useState({});

  const start = () => { setN(0); setSecs(0); setCall('live'); };
  const step = () => setN((v) => Math.min(v + 1, EVENTS.length));

  React.useEffect(() => {
    if (call !== 'live') return;
    const clock = setInterval(() => setSecs((s) => s + 1), 1000);
    const auto = setInterval(step, 2600);
    return () => { clearInterval(clock); clearInterval(auto); };
  }, [call]);
  React.useEffect(() => {
    if (call === 'live' && n === EVENTS.length) { const t = setTimeout(() => setCall('done'), 4000); return () => clearTimeout(t); }
  }, [n, call]);
  React.useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 'ArrowRight' && e.key !== ' ') return;
      e.preventDefault();
      if (call === 'idle') start(); else if (call === 'live') step();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [call]);

  const s = Object.assign({}, ...EVENTS.slice(0, n).map((e) => e.set || {}));
  const q = (title) => EVENTS.find((e) => e.title.startsWith(title)).quote;
  const elapsed = String(Math.floor(secs / 60)).padStart(2, '0') + ':' + String(secs % 60).padStart(2, '0');
  const waiting = { color: 'var(--text-meta)' };

  const doses = [s.met || 'not-confirmed', s.ram || 'not-confirmed', s.fur || 'not-confirmed', 'not-confirmed'];
  const confirmed = doses.filter((d) => d !== 'not-confirmed').length;
  const onCall = doses.filter((d) => d === 'taken').length;
  const tabletLine = call === 'idle' ? 'Laura will ask on the call.'
    : (onCall ? onCall + ' on the call' : 'None yet') + (s.fur ? ', one she says she took earlier' : '') + '. The evening one is still to come.';

  const errands = [
    ...(s.tea ? [{ id: 'tea', label: 'Tea', quote: q('Errand'), meta: call === 'live' ? 'Just now' : 'Today', isNew: call === 'live' }] : []),
    { id: 'bat', label: 'Hearing-aid batteries', quote: 'The little round ones.', meta: 'Wed' },
  ].map((it) => ({ ...it, done: !!ticked[it.id] }));
  const left = errands.filter((e) => !e.done).length;
  const todo = left === 0 ? 'Nothing to bring' : 'Bring ' + left + (left === 1 ? ' thing' : ' things');

  const feed = EVENTS.slice(0, n).reverse();
  const col = { flex: '1 1 300px', minWidth: 0 };

  return (
    <div style={{ padding: '0 24px 28px', maxWidth: 1760, margin: '0 auto', boxSizing: 'border-box' }}>
      <header style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px 40px', padding: '22px 20px' }}>
        <div style={{ font: '700 var(--size-wordmark)/1 var(--font-sans)', letterSpacing: '-.04em' }}>Laura</div>
        <nav style={{ display: 'flex', gap: 32, whiteSpace: 'nowrap' }}>
          <span style={{ fontWeight: 700, borderBottom: '3px solid var(--ink)', padding: '4px 0' }}>Today</span>
          <span style={{ padding: '4px 0' }}>Care plan</span>
          <span style={{ padding: '4px 0' }}>History</span>
        </nav>
        <div style={{ flex: 1 }} />
        <div>Lidia, 94 · Friday 13 November</div>
        <CallStatus state={call} elapsed={elapsed} calledAt="09:30" onCall={start} />
      </header>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--gap-cards)' }}>
        <AnswerCard style={{ flex: '1.5 1 420px', minWidth: 0 }} question="Is she okay today?"
          answer={s.today ? '\u201C' + q('Today') + '\u201D' : <span style={waiting}>{call === 'idle' ? 'Not called yet today' : 'Laura is asking\u2026'}</span>}>
          {s.sleep ? <QuoteFact inline fact="Sleep" quote={q('Sleep')} /> : <div style={waiting}>Sleep · not asked yet</div>}
        </AnswerCard>
        <AnswerCard style={col} nowrap question="Did she take her tablets?" answer={confirmed + ' of 4'}>
          <DoseBars doses={doses} style={{ marginBottom: 20 }} />
          <div style={{ color: 'var(--text-secondary)' }}>{tabletLine}</div>
        </AnswerCard>
        <AnswerCard style={{ ...col, paddingBottom: 26 }} tone="action" question="What do I need to do?" answer={todo}>
          <Checklist items={errands} onToggle={(i) => setTicked((t) => ({ ...t, [errands[i].id]: !t[errands[i].id] }))} />
        </AnswerCard>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--gap-cards)', marginTop: 'var(--gap-cards)', alignItems: 'flex-start' }}>
        <div style={{ flex: '3 1 640px', minWidth: 0 }}>
          <Card style={{ padding: '32px 40px 36px' }}>
            <div style={{ font: 'var(--text-meta-font)', fontWeight: 700, color: 'var(--text-secondary)' }}>Details from today's call</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '32px 56px', marginTop: 20 }}>
              <div style={{ flex: '1.35 1 320px', minWidth: 0 }}>
                <div style={{ font: 'var(--text-label)', marginBottom: 12 }}>Tablets</div>
                <QuoteFact fact="Metoprolol" detail="50 mg" quote={s.met && q('Metoprolol')} muted={!s.met} status={<StatusLabel status={doses[0]} />} />
                <QuoteFact fact="Ramipril" detail="5 mg" quote={s.ram && q('Ramipril')} muted={!s.ram} status={<StatusLabel status={doses[1]} />} />
                <QuoteFact fact="Furosemide" detail="40 mg" quote={s.fur && q('Furosemide')} muted={!s.fur} status={<StatusLabel status={doses[2]} />} />
                <QuoteFact fact="Atorvastatin" detail="20 mg · evening" muted status={<StatusLabel status="not-confirmed" />} />
              </div>
              <div style={col}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ font: 'var(--text-label)' }}>Blood pressure</span>
                  <span style={{ font: 'var(--text-meta-font)', color: 'var(--text-meta)' }}>{s.bp ? '09:34' : ''}</span>
                </div>
                <div style={{ font: '700 var(--size-reading)/1 var(--font-sans)', letterSpacing: 'var(--tracking-reading)', marginTop: 14, ...(s.bp ? {} : waiting) }}>{s.bp ? '138/82' : 'Not read yet'}</div>
                {s.bp ? <div style={{ font: 'var(--text-quote)', marginTop: 10, color: 'var(--text-secondary)' }}>{'\u201C' + q('Blood pressure') + '\u201D'}</div> : null}
                <DatedList style={{ marginTop: 16 }} items={[{ date: 'Thu 12 Nov', value: '142/85' }, { date: 'Wed 11 Nov', value: '136/80' }, { date: 'Tue 10 Nov', value: '145/88' }]} />
              </div>
              <div style={col}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ font: 'var(--text-label)' }}>Left leg</span>
                  <span style={{ font: 'var(--text-meta-font)', color: 'var(--text-meta)' }}>{s.leg ? '09:31' : ''}</span>
                </div>
                <div style={{ font: '700 var(--size-lead)/var(--leading-lead) var(--font-sans)', letterSpacing: 'var(--tracking-lead)', marginTop: 14, ...(s.leg ? {} : waiting) }}>{s.leg ? '\u201C' + q('Left leg') + '\u201D' : 'Not asked yet'}</div>
                <DatedList style={{ marginTop: 16 }} items={[{ date: 'Thu 12 Nov', quote: 'Swollen again by evening. I kept it up on the stool.' }, { date: 'Wed 11 Nov', quote: 'Heavy. The sock leaves a mark.' }]} />
              </div>
            </div>
          </Card>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--gap-cards)', marginTop: 'var(--gap-cards)', alignItems: 'flex-start' }}>
            <QuietRow style={col} title="Care plan" note="What Laura knows about her · read-only" open={open.plan} onToggle={() => setOpen((o) => ({ ...o, plan: !o.plan }))}>
              <KeyValueRows rows={[
                { label: 'Calls', value: 'Every day at 09:30, on her own phone' },
                { label: 'Morning', value: 'Metoprolol 50 mg, Ramipril 5 mg, Furosemide 40 mg' },
                { label: 'Evening', value: 'Atorvastatin 20 mg' },
                { label: 'Asks about', value: 'Sleep, left leg, blood pressure, what is running out' },
                { label: 'Family', value: 'Povilas, grandson' },
              ]} />
            </QuietRow>
            <QuietRow style={col} title="History" note={<StatLine label="Tablets confirmed on the call:" value="39 of 42" suffix="in the last two weeks" />} open={open.hist} onToggle={() => setOpen((o) => ({ ...o, hist: !o.hist }))}>
              <KeyValueRows rows={[
                { label: 'Thu 12 Nov', value: 'Done · 4 of 4 · \u201CSwollen again by evening. I kept it up on the stool.\u201D' },
                { label: 'Wed 11 Nov', value: 'Done · 4 of 4 · \u201CHeavy. The sock leaves a mark.\u201D' },
                { label: 'Tue 10 Nov', value: 'Done · 3 of 4 · Furosemide not taken. \u201CI\u2019ll leave the water one today, I\u2019m going out.\u201D' },
                { label: 'Mon 9 Nov', value: 'Done · 4 of 4 · \u201CSlept like a log. The leg is the same.\u201D' },
              ]} />
            </QuietRow>
          </div>
        </div>
        <Card tone="quiet" style={{ flex: '1 1 340px', minWidth: 0, padding: '32px 32px 28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', font: 'var(--text-meta-font)', color: 'var(--text-secondary)' }}>
            <b>Live from the call</b><span>Newest first</span>
          </div>
          <div style={{ marginTop: 8 }}>
            {feed.length === 0 ? <div style={{ padding: '14px 0 0', font: 'var(--text-quote)', color: 'var(--text-secondary)' }}>{call === 'live' ? 'Ringing\u2026' : 'Nothing yet. What she says arrives here during the call.'}</div> : null}
            {feed.map((e, i) => (
              <FeedItem key={e.title} title={e.title} time={e.t} quote={e.quote} speaker={e.speaker} isNew={i === 0 && call === 'live'} last={i === feed.length - 1} />
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
