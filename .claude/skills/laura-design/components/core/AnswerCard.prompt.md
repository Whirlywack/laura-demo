Level-1 card: a question the carer has, answered in the only large type on the page.

```jsx
<AnswerCard question="Is she okay today?" answer="“I'm all right. A bit tired, but all right.”">
  <QuoteFact inline fact="Sleep" quote="I woke at four and couldn't get back off." />
</AnswerCard>
<AnswerCard tone="action" question="What do I need to do?" answer="Bring 2 things">
  <Checklist items={errands} />
</AnswerCard>
```

Use three per screen at most, and only one with `tone="action"`.
