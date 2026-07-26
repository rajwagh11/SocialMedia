import { GoogleGenerativeAI } from "@google/generative-ai";

const MODEL = "gemini-2.5-flash";

function bufferToBase64(buffer) {
    return Buffer.from(buffer).toString("base64");
}

function hasInappropriateKeywords(text) {
    if (!text) return false;
    const inappropriateKeywords = [
        "nude", "naked", "nudity", "undressed",
        "sex", "sexual", "porn", "pornography", "xxx",
        "explicit", "nsfw", "adult content",
        "violence", "kill", "murder", "assault",
        "hate", "racist", "discrimination"
    ];

    return inappropriateKeywords.some(keyword => {
        // Uses word boundary matching to avoid false positives (e.g. matching "section" for "sex")
        const regex = new RegExp(`\\b${keyword}\\b`, "i");
        return regex.test(text);
    });
}

export async function moderateMediaAndText({ imageBytes, imageMimeType, caption }) {
    // 1. Instant local check for caption keywords
    if (caption && hasInappropriateKeywords(caption)) {
        return { 
            allowed: false, 
            reasons: ["Inappropriate text or keywords detected in caption"] 
        };
    }
    
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
        console.error("Missing GOOGLE_API_KEY environment variable.");
        // Fail-safe: Block upload if moderation service key is missing in production
        return { allowed: false, reasons: ["Moderation service unavailable."] };
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    const systemInstruction = `You are a strict content safety classifier for a social media app. Your job is to BLOCK inappropriate content.

Analyze the provided image and/or caption. BLOCK content if it contains:
- NSFW/sexual content (explicit or suggestive references to sex, sexual body parts, adult content)
- Nudity or partial nudity
- Graphic violence, blood, weapons, or harm
- Harassment, hate speech, or discriminatory content
- Illegal activities or substances

Return ONLY a JSON object:
{"allowed": false, "reasons": ["Reason for block"]}
OR
{"allowed": true, "reasons": []}`;

    // Configure model with strict safety settings and native JSON mode
    const model = genAI.getGenerativeModel({ 
        model: MODEL,
        systemInstruction: systemInstruction,
        generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.1, // Low temperature for deterministic classification
        },
        safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_LOW_AND_ABOVE" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_LOW_AND_ABOVE" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_LOW_AND_ABOVE" },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_LOW_AND_ABOVE" }
        ]
    });

    const parts = [];
    if (caption && caption.trim()) {
        parts.push({ text: `User caption: "${caption}"` });
    }
    if (imageBytes && imageMimeType && imageMimeType.startsWith("image/")) {
        parts.push({
            inlineData: {
                data: bufferToBase64(imageBytes),
                mimeType: imageMimeType,
            },
        });
    }

    if (parts.length === 0) {
        return { allowed: true, reasons: [] };
    }

    try {
        const result = await model.generateContent({ contents: [{ role: "user", parts }] });
        const response = await result.response;

        // Check for prompt or candidate safety blocks
        if (response.promptFeedback?.blockReason) {
            return {
                allowed: false,
                reasons: [`Blocked by AI safety filter: ${response.promptFeedback.blockReason}`]
            };
        }

        const candidate = response.candidates?.[0];
        if (candidate?.finishReason === "SAFETY") {
            return {
                allowed: false,
                reasons: ["Content blocked due to explicit or unsafe material."]
            };
        }

        const rawText = response.text() || "{}";
        const parsed = JSON.parse(rawText);

        return {
            allowed: Boolean(parsed.allowed),
            reasons: Array.isArray(parsed.reasons) ? parsed.reasons : [],
        };

    } catch (e) {
        console.error("Moderation error:", e.message);

        const errorMsg = String(e?.message || "").toLowerCase();

        // IF error was triggered by Gemini safety filters, BLOCK the content!
        if (errorMsg.includes("safety") || errorMsg.includes("blocked") || errorMsg.includes("harm")) {
            return {
                allowed: false,
                reasons: ["Explicit or inappropriate content detected by safety filters."]
            };
        }

        // Fail-closed default: Do not allow unmoderated posts on unknown system crashes
        return { 
            allowed: false, 
            reasons: ["Unable to verify content safety at this time. Please try again."] 
        };
    }
}