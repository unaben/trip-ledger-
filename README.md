# Trip Pricing & Profit Calculator

A tool for planning a multi-currency trip: enter costs in HUF, EUR or GBP
across several hotels and transport options, compare 3 group-size
scenarios side by side, submit the trip, then search and browse every
trip you've saved.

This README explains **how the code is organised and why**, in plain
English. You don't need to be an expert in Next.js to follow it.

---

## How to run it

```bash
npm install
npm run dev
```

Then open **http://localhost:3000**.

To try the "real" production version instead:

```bash
npm run build
npm run start
```

---

## The 3 pages

| Page | What it's for |
|---|---|
| `/` | **New trip form** - fill in the trip, see the 3-scenario comparison update live, then press **Submit trip** to save it. |
| `/trips` | **Saved trips** - search/filter by trip name and date, click any card to open it. |
| `/trips/[id]` | **Trip detail** - shows everything about one saved trip. Press **Edit** to turn it into the same editable inputs as the new-trip form, then **Save changes** to update it, or **Cancel** to discard your edits. |

The form does **not** save as you type. It keeps your edits in
memory, and only writes anything to storage when you press **Submit
trip** - at that point it's saved for good, a confirmation message
appears, and **the form clears itself back to a blank trip** so you can
start the next one straight away (the confirmation links to `/trips`
if you'd rather go look at what you just saved).

**The very first time the app is opened** - before anyone has submitted
a trip - the form fills itself in with a sample trip (Hévíz Hotel,
sample tours, etc.) so it's obvious what a filled-in trip looks like.
That sample only ever appears once: `useTripForm` checks with the
server (`GET /api/trips`) whether any trip has ever been submitted, and
only shows the sample when the answer is "none yet". Every reset after
that - including right after that very first submit - goes back to a
genuinely blank trip (`createBlankTripData`), not the sample again.

---

## The big idea: where does the data live?

Every submitted trip is stored as one JSON file on the server, at:

```
data/trips.json
```

It's a simple JSON array - one object per submitted trip. Three things
happen to that file, and **all three live in exactly one place**,
`lib/storage.ts`:

- **`createTrip(data)`** - called when the form is submitted. Adds a new
  trip to the array (with a generated id and timestamp) and saves it.
- **`listTrips(filter)`** - called by the `/trips` search page. Reads
  every trip and filters it down by name/date, in plain JavaScript.
- **`getTripById(id)`** - called by the `/trips/[id]` detail page. Finds
  one trip by its id.
- **`updateTrip(id, data)`** - called when you edit a saved trip and
  press Save. Finds the trip, replaces its details, keeps its original
  id and `createdAt`, and stamps a fresh `updatedAt`.

**Why this matters for Supabase (or any other database) later:** every
other file in the app - the API routes, the pages, the components -
only ever calls these three functions. None of them know or care that
the data currently lives in a JSON file. When you're ready to move to a
real database, you rewrite the *insides* of these three functions to
run database queries instead (e.g. `listTrips` becomes a `SELECT ... WHERE`
instead of a `.filter()`), and nothing else in the app has to change.

```
Browser  <--fetch-->  app/api/trips/route.ts        <--calls-->  lib/storage.ts  <--reads/writes-->  data/trips.json
Browser  <--fetch-->  app/api/trips/[id]/route.ts   <--calls-->  lib/storage.ts
```

---

## How the folders are organised

```
app/
  page.tsx                    the "/" route - renders the new trip form
  layout.tsx                  page shell (fonts, <html> tag)
  globals.css                 colours, fonts, sizes used everywhere ("design tokens")
  trips/
    page.tsx                  the "/trips" route - renders the saved trips list
    [id]/page.tsx              the "/trips/[id]" route - renders one trip's detail page
  api/
    trips/route.ts             GET (search/list) + POST (submit) - talks to lib/storage.ts
    trips/[id]/route.ts        GET (one trip's details) + PUT (save edits) - talks to lib/storage.ts

lib/
  storage.ts                   the only file that knows trips live in a JSON file (see above)

data/
  trips.json                   the actual saved trips (created automatically on first submit)

features/
  trip-calculator/              the "new trip" form
    trip-calculator.tsx/.css     the form screen
    trip-calculator.types.ts     shapes of all our data (TypeScript types), shared by every feature
    trip-calculator.logic.ts     the maths: cost per scenario, profit, etc.
    trip-calculator.utils.ts     currency conversion, number/money formatting
    trip-calculator.defaults.ts  starting data for a brand-new form (see below)
    hooks/use-trip-form.ts       holds the form's state in memory, submits it on demand
    components/
      trip-metadata-form/        trip name, date range, exchange rates
      accommodation-section/     the list of hotel stays (see below)
      transportation-section/    the list of transport costs (see below)
      program-list/              everything else: tours, meals, therapy...
      scenario-board/            the 3 side-by-side scenario "receipts"

  trip-list/                    the "/trips" search page
    trip-list.tsx/.css/.types.ts
    hooks/use-trip-list.ts       calls GET /api/trips with the current filter

  trip-detail/                  the "/trips/[id]" read-only page
    trip-detail.tsx/.css/.types.ts
    hooks/use-trip-detail.ts     calls GET /api/trips/<id>, and PUT to save edits
```

Each component/feature folder follows the same pattern: `name.tsx` (what's
on screen), `name.css` (how it looks), `name.types.ts` (what data it
expects). Logic and maths live in their own files, separate from any
component. That's the "clean architecture" idea in practice - change
one thing without touching the rest.

---

## Accommodation: several hotels, each with their own nights

A trip isn't always one hotel for the whole stay. The Accommodation
section is a **list of stays** - e.g. "2 nights at Hotel A" followed by
"3 nights at Hotel B" - and every stay adds to the total. They are not
alternatives to pick between; if it's listed, it's included.

```
one stay's cost = price per night × that stay's nights × total travelers
```

Add as many stays as the trip needs; remove any you don't.

## Transportation: several transport costs, each with their own quantity

Works the same way as accommodation, for things like an airport coach
plus an inter-city train. Every item in the list adds to the total.
Each item has a **"units"** count for how many times that cost happens
(e.g. a round trip = 2 units):

```
one item's cost = price × units × (total travelers, only if "per person")
```

A "flat / group" item ignores traveler count entirely (e.g. one coach
hire); a "per person" item is multiplied by how many travelers are on
that scenario.

---

## How the maths works (`trip-calculator.logic.ts`)

For each of the 3 scenarios:

1. **Every accommodation stay's cost** is added up (see formula above).
2. **Every transportation item's cost** is added up (see formula above).
3. **Every other program's cost** (tours, meals, therapy...) is added -
   either a flat group price, or a per-person price × total travelers.
4. **Total expense** = the sum of all of the above.
5. **Expense per person** = total expense ÷ **number of payers** (not
   total travelers) - the idea being the payers are the ones actually
   splitting the bill between themselves.
6. **Revenue** = package sale price × number of payers.
7. **Profit** = revenue − total expense.

None of these functions know anything about React or the screen - they
just take numbers in and give numbers back, which makes them easy to
read and easy to test on their own.

---

## What "clean architecture" means here, in one sentence

**The screen (`.tsx`), the way things look (`.css`), the shape of the
data (`.types.ts`), and the actual maths (`.logic.ts` / `.utils.ts`)
each live in their own file - and the one function that knows data is
stored as JSON (`lib/storage.ts`) is the only thing you'll need to
change when you move to a real database.**
