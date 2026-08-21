import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";

let client;
try {
  client = new Anthropic();
} catch {
  client = null;
}

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

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "method not allowed" });
  }

  if (!process.env.SITE_PASSWORD || req.headers["x-site-password"] !== process.env.SITE_PASSWORD) {
    return res.status(401).json({ error: "unauthorized" });
  }

  if (!client) {
    return res.status(500).json({ error: "ANTHROPIC_API_KEY is not configured on the server" });
  }

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
    res.status(200).json(response.parsed_output);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "extraction failed" });
  }
}
