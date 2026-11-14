Header control that shows today's call as not called yet, live, or done, and holds the "Call now" button.

```jsx
<CallStatus state="idle" onCall={start} />
<CallStatus state="live" elapsed="04:12" />
<CallStatus state="done" calledAt="09:30" />
```

The live state carries a burgundy dot and the "Call now" button is burgundy. The idle and done states were not drawn in the approved mockups; they follow the same pill shape.
