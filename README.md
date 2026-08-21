# UT Schedule → Google Calendar

A static website: screenshot your UT Austin class list, drop it in, verify the extracted classes, download an `.ics` file for the semester, import into Google Calendar.

No server, no account, no API key, no AI. Text is read straight out of the screenshot in your browser using [Tesseract.js](https://github.com/naptha/tesseract.js) (OCR, via WebAssembly) and parsed with a plain heuristic parser. Nothing about your schedule ever leaves your machine.

## Running it

It's a plain static site — open `public/index.html` directly in a browser, or serve the `public/` folder with anything (`npx serve public`, GitHub Pages, Vercel, etc.).

## Using it

1. Log into UT Direct, open `classlist.WBX`, make sure your full schedule table fits on screen (zoom out with `⌘−` if it's long)
2. Screenshot it (Mac: `⌘⇧4` then drag, or `⌘⌃⇧4` to copy straight to your clipboard)
3. Drag the screenshot into the drop zone, click to choose a file, or paste (`⌘V`), then **Extract classes from screenshot**
4. OCR can misread the occasional character — if it does, either fix the row by hand or use the "paste the schedule text directly" fallback under the drop zone (select and copy the visible text on the page instead of screenshotting it; it uses the same parser and is more reliable when it's an option)
5. Verify the extracted rows
6. Confirm semester dates (defaults are UT's official Fall 2026 calendar: classes Aug 24–Dec 7, Labor Day and Thanksgiving break pre-filled as excluded)
7. **Download calendar file (.ics)**
8. Import at [calendar.google.com → Settings → Import & export](https://calendar.google.com/calendar/u/0/r/settings/export)
