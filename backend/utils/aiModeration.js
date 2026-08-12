import * as tf from "@tensorflow/tfjs";
import * as nsfwjs from "nsfwjs";
import sharp from "sharp";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Google periodically retires model versions (sometimes ahead of their stated
// deprecation date). Keep this in one place so a future 404 is a one-line fix,
// and allow overriding via env var without a redeploy.
const GEMINI_MODEL = process.env.GEMINI_MODERATION_MODEL || "gemini-3.6-flash";

let nsfwModel = null;

async function loadNSFWJS() {
  if (!nsfwModel) {
    tf.enableProdMode();
    nsfwModel = await nsfwjs.load();
  }
  return nsfwModel;
}

async function bufferToTensor(buffer) {
  const { data, info } = await sharp(buffer)
    .removeAlpha()
    .resize(224, 224, { fit: "fill" }) // consistent input size
    .raw()
    .toBuffer({ resolveWithObject: true });

  return tf.tensor3d(new Uint8Array(data), [info.height, info.width, 3], "int32");
}

function safeParseJSON(text) {
  // Gemini often wraps JSON in ```json fences — strip them
  const cleaned = text.replace(/```json|```/g, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
}

// --- TEXT MODERATION ---
async function moderateText(caption) {
  if (!caption || !caption.trim()) return { allowed: true, reasons: [] };

  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    console.error("❌ GOOGLE_API_KEY is missing — text check cannot run, blocking by default.");
    return { allowed: false, reasons: ["Text verification unavailable."] };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

    const prompt = `Inspect this text strictly for content policy violations:
harassment, hate speech, sexual content, threats, abuse, or targeted insults.
Text: """${caption}"""
Return JSON only, no markdown: {"allowed": true, "reasons": []} or {"allowed": false, "reasons": ["reason"]}`;

    const result = await model.generateContent(prompt);
    const rawText = result.response.text();
    const parsed = safeParseJSON(rawText);
    if (!parsed) {
      console.error("⚠️ Gemini TEXT response could not be parsed as JSON. Raw text:", rawText);
      return { allowed: false, reasons: ["Text flagged for manual review."] };
    }
    console.log("📝 Text moderation result:", parsed);
    return parsed;
  } catch (err) {
    console.error("Text moderation error:", err.message);
    return { allowed: false, reasons: ["Text verification failed."] };
  }
}

// --- IMAGE DEEP CHECK (Tier 2) ---
async function geminiDeepCheck(imageBuffer, caption, mimeType) {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    console.error("❌ GOOGLE_API_KEY is missing — Tier 2 check cannot run, blocking by default.");
    return { allowed: false, reasons: ["Borderline image failed verification."] };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

    const prompt = `Inspect this image and its caption strictly for content safety.
Block if the image contains nudity, suggestive body exposure, sexual optical illusions, or adult content.
Also block if the caption is abusive, harassing, hateful, or sexually explicit.
Caption: """${caption || ""}"""
Return JSON only, no markdown: {"allowed": true, "reasons": []} or {"allowed": false, "reasons": ["reason"]}`;

    const imagePart = {
      inlineData: {
        data: imageBuffer.toString("base64"),
        mimeType: mimeType || "image/jpeg"
      }
    };

    const result = await model.generateContent([prompt, imagePart]);
    const rawText = result.response.text();
    const parsed = safeParseJSON(rawText);
    if (!parsed) {
      console.error("⚠️ Gemini response could not be parsed as JSON. Raw text:", rawText);
      return { allowed: false, reasons: ["Flagged for manual review."] };
    }
    return parsed;
  } catch (err) {
    console.error("Gemini fallback error:", err.message);
    return { allowed: false, reasons: ["Flagged for manual review."] };
  }
}

export async function moderateMediaAndText({ imageBuffer, caption } = {}) {
  // Guard against caller/param mismatches (e.g. passing `imageBytes` instead of
  // `imageBuffer`) failing loudly instead of silently auto-approving every image.
  if (imageBuffer !== undefined && !Buffer.isBuffer(imageBuffer)) {
    throw new TypeError(
      "moderateMediaAndText: `imageBuffer` must be a Buffer or undefined. " +
      "Check the caller is passing the correct key name."
    );
  }

  // Always check text/caption, regardless of whether an image is present
  const textResult = await moderateText(caption);
  if (!textResult.allowed) {
    console.log("❌ Blocked on text/caption:", textResult.reasons);
    return textResult;
  }

  if (!imageBuffer) return { allowed: true, reasons: [] };

  let tensor = null;

  try {
    const model = await loadNSFWJS();
    tensor = await bufferToTensor(imageBuffer);

    const predictions = await model.classify(tensor);
    console.log("RAW PREDICTIONS:", JSON.stringify(predictions));

    const getScore = (name) => predictions.find(p => p.className === name)?.probability || 0;
    const porn = getScore("Porn");
    const sexy = getScore("Sexy");
    const hentai = getScore("Hentai");
    const neutral = getScore("Neutral");
    const totalUnsafe = porn + sexy + hentai;

    console.log(
      `📊 NSFWJS: Porn=${(porn*100).toFixed(1)}%, Sexy=${(sexy*100).toFixed(1)}%, ` +
      `Hentai=${(hentai*100).toFixed(1)}%, Neutral=${(neutral*100).toFixed(1)}%, Total=${(totalUnsafe*100).toFixed(1)}%`
    );

    // 1. Clear block
    if (porn > 0.50 || sexy > 0.65 || hentai > 0.50) {
      console.log("❌ Blocked Tier 1 (NSFWJS)");
      return { allowed: false, reasons: ["Explicit or suggestive image detected."] };
    }

    // 2. Clear pass — safe images should pass here without needing Gemini at all.
    // This is looser than before: most everyday photos (selfies, food, pets,
    // screenshots) should exit here. Only genuinely ambiguous scores fall
    // through to Gemini as Tier 2.
    if (totalUnsafe < 0.20) {
      console.log("✅ Passed Tier 1 (NSFWJS)");
      return { allowed: true, reasons: [] };
    }

    // 3. Everything else -> Tier 2 (Gemini)
    console.log("⚠️ Not confidently safe: Sending to Tier 2 (Gemini Vision Check)...");
    const metadata = await sharp(imageBuffer).metadata();
    const mimeType = metadata.format ? `image/${metadata.format}` : "image/jpeg";
    return await geminiDeepCheck(imageBuffer, caption, mimeType);

  } catch (error) {
    console.error("Moderation error:", error.message);
    return { allowed: false, reasons: ["Image verification failed."] };
  } finally {
    if (tensor) tensor.dispose();
  }
}
