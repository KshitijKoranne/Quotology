# Quotology

A daily quote app for iOS and Android. Expo + React Native, one codebase.

Eight quotes a day, drawn from a bundled archive and six free public APIs at
once — including the Bhagavad Gita cited to chapter and verse, and the
Mahabharata in the public-domain Ganguli translation. Pick your subjects and
every set stays inside them. Any quote can be exported as a poster.

Design direction **1b — "Poster"**, from the Claude Design canvas in `design/`:
modernist discipline, ruled rows, zero corner radius, colour floods a row from
left to right when it opens, and the detail screen is a poster with the quote
set as the image.

---

## Run it

    npm install --legacy-peer-deps
    npx expo start

Scan the QR code with **Expo Go** to see every screen.

The share card uses `react-native-view-shot`, which Expo Go does not contain.
To test the poster export and save-to-photos, make a development build:

    npm install -g eas-cli
    eas build --profile development --platform ios
    eas build --profile development --platform android

## Checks before a release

    npx tsc --noEmit
    npx expo-doctor                                  # must stay 21/21
    npx expo export --platform all --no-bytecode

Hermes bytecode compilation can fail on some machines with a `hermesc` error.
That is a local toolchain problem, not a code fault — hence `--no-bytecode`.

## How it is put together

    app/            screens (expo-router)
      (tabs)/       home, search, library, settings
      detail.tsx    the full poster
      onboarding.tsx, topics.tsx, attributions.tsx
    src/
      quotes.ts     the data layer — archive, categories, six live sources
      store.tsx     app state, storage, the daily notification queue
      ui.tsx        poster, share sheet, toast
      theme.ts      design tokens and the three typefaces
    assets/data/    quotes.json (2,466) + scripture.json (209 Mahabharata)
    design/         the design source of truth — reference only, do not edit

### Quotes

Two tiers. A bundled archive ships in the binary so the app always has
something to show, and six free keyless APIs are called **in parallel** and
interleaved round-robin with it, so a set is never one source's output. A
quote's identity is a hash of its text, so the same quote from any source is
one quote — saving it twice is not possible.

### Type

- **Playfair Display Bold Italic** — the Quotology wordmark only
- **Bricolage Grotesque ExtraBold** — screen titles and the quote itself
- **Inter** — all interface text

The shipped `.ttf` files are static instances cut from the variable originals
with `fonttools`, renamed internally to match their `require()` key. Adding a
weight means cutting it the same way; a raw variable font renders only its
default instance on React Native.

### Notifications

The daily quote is a queue of thirty one-shot notifications, each seeded by its
own date so the push and that morning's set agree, refilled whenever the app
opens. A repeating daily trigger would carry one frozen payload and deliver the
same sentence every morning.

## Licence and attribution

The source code is MIT — see [LICENSE](LICENSE).

The quotations, the APIs and the typefaces are not. Every source is credited in
[NOTICE.md](NOTICE.md) and on the Attributions screen inside the app. If you
hold rights in something here and want it removed, open an issue.

## Privacy

No account, no analytics, no advertising, no server. Saved quotes and settings
stay on the device. The only thing that leaves the phone is a request to the
six quote APIs. Full text: [docs/privacy.md](docs/privacy.md).
