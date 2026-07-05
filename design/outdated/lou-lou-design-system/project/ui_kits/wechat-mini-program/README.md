# Lou Lou — WeChat Mini Program UI Kit

Pixel-faithful recreation of the **Lou Lou** Mini Program, rendered inside an
iPhone-style device frame. Built from the brand spec + 3-screen moodboard
supplied by the team — no production codebase was available, so all
interaction is mocked but visually true to the moodboard.

## What's inside

| File | Role |
|---|---|
| `index.html` | App entry — pulls React/Babel from CDN and loads all the pieces |
| `app.jsx` | Router & tab state, sheet/toast plumbing |
| `icons.jsx` | 2px-stroke icon set + filled variants for active tabs |
| `components.jsx` | `CTAButton`, `TopNav`, `HeroPill`, `CategoryChips`, `PetStageCard`, `AttrTag`, `StatTile`, `ProgressRing`, `TabBar`, `RatingPill` |
| `HomeScreen.jsx` | "Pamper Your Pet" hero, category chips, stacked pet cards |
| `DetailScreen.jsx` | Service detail w/ rating pill, pastel attribute tags, sticky CTA |
| `ActivityScreen.jsx` | Stat tiles + multicolour goal-progress ring + "Log New Walk" |
| `BookingsScreen.jsx` | List of upcoming bookings with status chip |
| `ProfileScreen.jsx` | Account, My Pets, settings list |
| `BookingSheet.jsx` | Bottom-sheet booking confirmation with total |
| `ios-frame.jsx` | iPhone bezel + status bar + home indicator (starter component) |

## Click-through

- **Home** → tap any pet card → **Detail** → tap *Book Service* → confirmation
  sheet → *Confirm Booking* → toast + returns home.
- **Bottom tabs**: Home · Bookings · Activity · Profile.
- **Activity** has its own *Log New Walk* CTA + *View History* link.

## Faithfulness notes

- Layout, colours, radii and the dark-pill header at top of Home come straight
  from the moodboard.
- The dark CTA pill, multicolour progress ring, and pastel stat tiles are
  pixel-matched.
- **Pet photography is placeholder** — emojis on pastel stages stand in for
  real shots. Drop in actual transparent-PNG pet portraits when available.
- Icons use a custom 2px-stroke set in `icons.jsx`. They follow Lucide's
  geometry but are inlined so the prototype works offline.
