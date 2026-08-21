# UT Schedule → Google Calendar

Screenshot your UT Austin class list, drop it into the page, verify the extracted classes, download an `.ics` file for the semester, import into Google Calendar. Uses Claude's vision to read the screenshot.

Deployed on Vercel: static frontend in `public/`, one serverless function at `api/extract.js`.

## Deploy

1. Push this repo to GitHub (already connected: `Dioscurias/UT-Calendar`) and import it in the Vercel dashboard, or run `vercel` from this directory.
2. In the Vercel project's **Settings → Environment Variables**, set:
   - `ANTHROPIC_API_KEY` — from https://console.anthropic.com/settings/keys
   - `SITE_PASSWORD` — any password you pick. The deployed URL is public, so this is what stops strangers from hitting `/api/extract` and spending your API budget. Without it set, the endpoint refuses every request (fails closed).
3. Redeploy after setting env vars (Vercel doesn't hot-reload them into an existing deployment).

## Local development

```bash
npm install
cp .env.example .env   # fill in ANTHROPIC_API_KEY and SITE_PASSWORD
npx vercel dev
```

`vercel dev` emulates the same routing as production (`api/*.js` → serverless functions, `public/` → static). Plain `node` won't work here since there's no `app.listen()` — Vercel calls the exported handler directly.

## Using it

1. Log into UT Direct, open `classlist.WBX`, make sure your full schedule table fits on screen (zoom out with `⌘−` if it's long)
2. Screenshot it (Mac: `⌘⇧4` then drag, or `⌘⌃⇧4` to copy straight to your clipboard)
3. On the page, enter the site password, then drag the screenshot into the drop zone, click to choose a file, or paste (`⌘V`)
4. **Extract classes from screenshot**, then verify the rows — vision reading can occasionally misread a time or room
5. Confirm semester dates (defaults are UT's official Fall 2026 calendar: classes Aug 24–Dec 7, Labor Day and Thanksgiving break pre-filled as excluded)
6. **Download calendar file (.ics)**
7. Import at [calendar.google.com → Settings → Import & export](https://calendar.google.com/calendar/u/0/r/settings/export)

## Notes

- Nothing about your schedule is stored server-side — the screenshot goes straight to Anthropic's API for extraction and the response goes straight back.
- `.env` / `.env.local` are gitignored — don't commit your API key or password. Vercel env vars are configured in the dashboard, not from a committed file.
