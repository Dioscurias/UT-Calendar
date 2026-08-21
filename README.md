# UT Schedule → Google Calendar

A local website: screenshot your UT Austin class list, drop it in, verify the extracted classes, download an `.ics` file for the semester, import into Google Calendar.

Needs your own Anthropic API key (billed per use — a few cents per screenshot) since it uses Claude's vision to read the screenshot.

## Setup

```bash
cd server
npm install          # already done if you're reading this after setup
cp .env.example .env
```

Edit `.env` and set `ANTHROPIC_API_KEY` — get one at https://console.anthropic.com/settings/keys

Then run it:

```bash
npm start
```

Open **http://127.0.0.1:8787** in your browser. It only listens on `127.0.0.1` — nothing outside your machine can reach it.

## Using it

1. Log into UT Direct, open `classlist.WBX`, make sure your full schedule table fits on screen (zoom out with `⌘−` if it's long)
2. Screenshot it (Mac: `⌘⇧4` then drag, or `⌘⌃⇧4` to copy straight to your clipboard)
3. On the page, drag the screenshot into the drop zone, click to choose a file, or just paste (`⌘V`) — then **Extract classes from screenshot**
4. Verify the extracted rows — vision reading can occasionally misread a time or room, so check each one
5. Confirm semester dates (defaults are UT's official Fall 2026 calendar: classes Aug 24–Dec 7, Labor Day and Thanksgiving break pre-filled as excluded)
6. **Download calendar file (.ics)**
7. Import at [calendar.google.com → Settings → Import & export](https://calendar.google.com/calendar/u/0/r/settings/export)

## Notes

- Nothing about your schedule leaves your machine except the one screenshot sent to Anthropic's API for extraction — the server never logs or stores it.
- `.env` is gitignored — don't commit your API key.
