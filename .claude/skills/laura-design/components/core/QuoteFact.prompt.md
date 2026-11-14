A fact plus her quotation; the basic row for tablets and any other item recorded on a call.

```jsx
<QuoteFact fact="Concor" detail="50 mg" quote="There. I've swallowed it." status={<StatusLabel status="taken" />} />
<QuoteFact inline fact="Sleep" quote="I woke at four and couldn't get back off." />
```

Never render a fact without a quote unless nothing was said (then use `muted`).
