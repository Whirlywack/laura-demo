# Laura

Laura phones an elderly Care recipient, reminds her and records what she says, and her Family carer sees it on one page while they talk.

## People

**Care recipient**:
The person Laura phones; in the demo, Lidia.
_Avoid_: Patient, user, client, elder

**Family carer**:
The relative who set Laura up and reads the page; in the demo, Povilas.
_Avoid_: Caregiver, admin, user

**Laura**:
The voice agent who phones the Care recipient. A proper noun, never a person, and never a giver of medical advice.
_Avoid_: Bot, assistant, AI

**Family phrase**:
The agreed sentence Laura says, only after the Care recipient has confirmed who she is, to show the call comes from the family.
_Avoid_: Password, code word, passphrase

## Calls

**Call**:
One phone conversation between Laura and the Care recipient.
_Avoid_: Session, conversation

**Call status**:
Where the Call stands: not called yet, live, or done. A Call is live from the moment it is placed, ringing included, and done only once Laura records its Call summary; a Call that ends any other way stays live until the next Call replaces it.
_Avoid_: Ringing, answered, ended, failed

**Call summary**:
What Laura says she noted, recorded as she closes the Call; it is what makes the Call done.
_Avoid_: Recap, report

**Today**:
The latest Call and everything recorded on it, whatever the calendar date.
_Avoid_: Today's date

**History**:
Every Call before the latest one.

## What Laura records

**Entry**:
One thing Laura records during a Call, carrying a Quote.
_Avoid_: Card, note, event, observation

**Quote**:
The Care recipient's own words that an Entry carries, shown with it as proof.

**Wellbeing**:
How the Care recipient says she is, in one of two aspects: general or sleep. The Quote is the whole record; Laura does not summarise it.
_Avoid_: Mood, status

**Reading**:
A blood pressure measurement the Care recipient reads out: systolic over diastolic, with pulse when she gives it. Repeated back, never judged.
_Avoid_: Measurement, vitals

**Pass-on**:
Anything Laura promises to pass on to the Family carer, such as a medical question, an emergency or a worry. Laura may only promise to tell the Family carer something if she records it as a Pass-on.
_Avoid_: Alert, flag, escalation, message

**Remark**:
The Care recipient's words about a Watch item that has no Reading, such as how her left leg is today.
_Avoid_: Comment, symptom, note

**Errand**:
Something the Care recipient is running out of at home that the Family carer could bring.
_Avoid_: Shopping item, order, task

## Medications

**Care plan**:
The stored list of the Care recipient's Medications and Watch items; the only source of what Laura names.
_Avoid_: Prescription, schedule

**Watch item**:
Something on the Care plan that Laura asks about on every Call: blood pressure (answered with a Reading) or left leg swelling (answered with a Remark).
_Avoid_: Symptom, check, condition

**Medication**:
One item on the Care plan: a name, a Strength and a time of day.
_Avoid_: Tablet, drug, pill (Laura may say "tablets" aloud)

**Strength**:
How much of a Medication one intake is, e.g. "47.5 mg, one tablet".
_Avoid_: Dose

**Dose**:
One scheduled intake of one Medication on one Call.
_Avoid_: Tablet, intake

**Dose status**:
What is known about a Dose: not confirmed, taken on call, says taken earlier, or not taken. Not confirmed means nothing has been recorded yet; when two Entries cover the same Dose, the later one wins.
