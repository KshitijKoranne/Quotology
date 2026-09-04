# Quotology

A daily quote app for iOS and Android. One codebase, Expo + React Native.

Design direction **1b — "Poster"** from the Claude Design canvas in `design/`:
Modernist discipline, ruled rows, zero corner radius, colour floods a row from
left to right when it opens, and the detail screen is a poster with the quote
set as the image.

---

## Run it

Install the tools one time:

    npm install -g eas-cli

Then:

    npm install
    npx expo start

Scan the QR code with the Expo Go app to see most screens.

**Note:** the share card uses `react-native-view-shot`, which Expo Go does not
contain. To test share and save-to-photos, make a development build:

    eas build --profile development --platform ios
    eas build --profile development --platform android

## Build for the stores

    eas build --profile production --platform ios
    eas build --profile production --platform android

Then submit:

    eas submit --platform ios
    eas submit --platform android

Bundle ID and package name: `in.kjrlabs.quotology`

---

## Quote sources

Two tiers. The app never shows an error state, because the archive is always
the fallback.

| Tier | Source | Notes |
|---|---|---|
| Live | [ZenQuotes](https://zenquotes.io) `GET /api/quotes` | Keyless. 5 calls per 30 s per IP. |
| Live | [DummyJSON](https://dummyjson.com) `GET /quotes/random/8` | Keyless. No rate limit found. |
| Local | [QuoteSlate archive](https://github.com/Musheer360/QuoteSlate) | 2,611 quotes, 1,010 authors, 30 tags. Bundled in `assets/data/quotes.json` (403 KB). |

The live APIs give no tags. `guessTags()` in `src/quotes.ts` borrows the
author's dominant tag from the archive, so tags stay usable everywhere.

Search, the tag chips and the Library collections all read the archive, so they
work with no network.

## Fonts

Archivo 400 / 600 / 700 / 800 (SIL Open Font License), bundled as TTF in
`assets/fonts/`. No network fetch at runtime.

---

## Layout

    app/
      _layout.tsx          fonts, splash, store, notification handler
      (tabs)/_layout.tsx   the dark floating tab bar
      (tabs)/index.tsx     Home — ruled rows with the flood reveal
      (tabs)/search.tsx    Search — archive-wide, tag chips
      (tabs)/library.tsx   Library — collections and saved quotes
      (tabs)/settings.tsx  Settings — daily push, quote size, source status
      detail.tsx           Full poster
      onboarding.tsx       Three-step intro
      lock.tsx             Lock screen and widget preview
    src/
      theme.ts             Design tokens from the Modernist design system
      quotes.ts            Archive, live APIs, search, daily set
      store.tsx            State + AsyncStorage + daily notification
      ui.tsx               Poster, Toast, ShareSheet
      icons.tsx            SVG icons
    design/                The imported Claude Design source. Reference only.

## Data on the device

Nothing leaves the phone. Saved quotes, quote size and the push setting live in
`AsyncStorage`. There are no accounts and no analytics.

## To do before the stores

1. Add screenshots (6.7" iPhone and Android phone).
2. Write the store listing and privacy policy. The policy is short: no data
   collection.
3. Set the Apple team and Google service account in `eas.json` `submit`.
