Quiet read-only block for the care plan and history: folded by default, opened on request.

```jsx
<QuietRow title="Care plan" note="What Laura knows about her · read-only" open={open} onToggle={toggle}>
  <KeyValueRows rows={[{ label: 'Calls', value: 'Every day at 09:30, on her own phone' }]} />
</QuietRow>
```

Nothing inside is editable. Keep it below the details card.
