import "dotenv/config";
import express from "express";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 8787;

if (!process.env.ANTHROPIC_API_KEY) {
  console.error("Missing ANTHROPIC_API_KEY. Copy .env.example to .env and fill it in.");
  process.exit(1);
}

const client = new Anthropic();

const ScheduleSchema = z.object({
  classes: z.array(
    z.object({
      title: z.string().describe("Course code and name, e.g. 'C S 313E Elements of Software Design'"),
      days: z.array(z.enum(["MO", "TU", "WE", "TH", "FR", "SA", "SU"])),
      startTime: z.string().describe("24-hour HH:MM, e.g. '09:00'"),
      endTime: z.string().describe("24-hour HH:MM, e.g. '09:50'"),
      location: z.string().describe("Building and room, e.g. 'GDC 2.216'"),
    }),
  ),
});

const EXTRACT_PROMPT = `This is a screenshot of a university student's course schedule page.
Extract every course that has a fixed weekly meeting time. For each one, give:
- title: course prefix/number and name if visible
- days: the days of the week it meets, as two-letter codes (MO, TU, WE, TH, FR, SA, SU)
- startTime / endTime: in 24-hour HH:MM format
- location: building and room

Skip rows with no fixed meeting time (e.g. "TBA", fully asynchronous online courses, independent study). If a field truly isn't visible, use your best reading of the text rather than guessing wildly.`;

const app = express();
app.use(express.json({ limit: "10mb" }));
app.use(express.static(path.join(__dirname, "public")));

app.post("/extract", async (req, res) => {
  const { image, mediaType } = req.body || {};
  if (!image) return res.status(400).json({ error: "missing image" });

  try {
    const response = await client.messages.parse({
      model: "claude-opus-5",
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: mediaType || "image/png", data: image } },
            { type: "text", text: EXTRACT_PROMPT },
          ],
        },
      ],
      output_config: { format: zodOutputFormat(ScheduleSchema) },
    });

    if (!response.parsed_output) {
      return res.status(502).json({ error: "model did not return parseable output" });
    }
    res.json(response.parsed_output);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "extraction failed" });
  }
});

app.listen(PORT, "127.0.0.1", () => {
  console.log(`Open http://127.0.0.1:${PORT} in your browser`);
});
