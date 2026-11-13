One entry in the live call feed; stack them newest first inside a quiet Card.

```jsx
<Card tone="quiet">
  <FeedItem isNew title="Errand added · Tea" quote="I'm nearly out of tea. Two bags left." />
  <FeedItem title="Blood pressure · 138/82" time="09:34" quote="One thirty-eight over eighty-two. I wrote it down." />
  <FeedItem speaker="laura" title="Laura said" time="09:32" quote="Take them now, take your time, I'll wait." last />
</Card>
```

Only one item is `isNew` at a time. The feed stays quiet; it is level 3 on the page.
