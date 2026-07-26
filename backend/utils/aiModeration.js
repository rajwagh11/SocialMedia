import { GoogleGenerativeAI } from "@google/generative-ai";

const MODEL = "gemini-2.5-flash";

function bufferToBase64(buffer) {
	return Buffer.from(buffer).toString("base64");
}


function hasInappropriateKeywords(text) {
	if (!text) return false;
	const lowerText = text.toLowerCase();
	const inappropriateKeywords = [
		"nude", "naked", "nudity", "undressed",
		"sex", "sexual", "porn", "pornography", "xxx",
		"explicit", "nsfw", "adult content",
		"violence", "kill", "murder", "assault",
		"hate", "racist", "discrimination"
	];
	return inappropriateKeywords.some(keyword => lowerText.includes(keyword));
}

export async function moderateMediaAndText({ imageBytes, imageMimeType, caption }) {
    if (caption && hasInappropriateKeywords(caption)) {
        return { 
            allowed: false, 
            reasons: ["Inappropriate content detected in caption"] 
        };
    }
    
    const apiKey = process.env.GOOGLE_API_KEY || "AIzaSyCbjh5GaK1lRy5uX_lowegz1YSfVAmaH30";
    if (!apiKey) {
        console.log("Missing GOOGLE_API_KEY");
        return { allowed: true, reasons: ["Moderation skipped: missing GOOGLE_API_KEY"] };
    }

	const genAI = new GoogleGenerativeAI(apiKey);
	const model = genAI.getGenerativeModel({ 
		model: MODEL,
		safetySettings: [
			{
				category: "HARM_CATEGORY_HARASSMENT",
				threshold: "BLOCK_MEDIUM_AND_ABOVE"
			},
			{
				category: "HARM_CATEGORY_HATE_SPEECH",
				threshold: "BLOCK_MEDIUM_AND_ABOVE"
			},
			{
				category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
				threshold: "BLOCK_MEDIUM_AND_ABOVE"
			},
			{
				category: "HARM_CATEGORY_DANGEROUS_CONTENT",
				threshold: "BLOCK_MEDIUM_AND_ABOVE"
			}
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

    const systemInstruction = `You are a strict content safety classifier for a social media app. Your job is to BLOCK inappropriate content.

BLOCK content if it contains:
- NSFW/sexual content (explicit or suggestive references to sex, sexual acts, sexual body parts)
- Nudity (words like "nude", "naked", "undressed", or any explicit nudity references)
- Violence (graphic violence, threats, harm)
- Hate/Harassment (discriminatory language, bullying, harassment)
- Self-harm (promotion or description of self-harm)
- Illegal activity (drugs, weapons, illegal services)

IMPORTANT: Block ANY caption containing words related to nudity, sexual content, or explicit material - even if used casually or in context. Words like "nude", "naked", "sex", "porn", etc. should trigger a block.

Return ONLY a JSON object, no other text:
{"allowed":false, "reasons":["Nudity","NSFW/sexual"]}
or
{"allowed":true, "reasons":[]}

Be strict - when in doubt, BLOCK the content.`;

	const prompt = [{ text: systemInstruction }, ...parts];

	try {
		const result = await model.generateContent({ contents: [{ role: "user", parts: prompt }] });
		
		const promptFeedback = result.response.promptFeedback;
		if (promptFeedback && promptFeedback.blockReason) {
			
			return { 
				allowed: false, 
				reasons: ["Content blocked by safety filters: " + promptFeedback.blockReason] 
			};
		}
		
		const text = result.response.text() || "";
		let parsed;
		try {
			parsed = JSON.parse(text);
		} catch {
			const match = text.match(/\{[\s\S]*\}/);
			parsed = match ? JSON.parse(match[0]) : { allowed: true, reasons: [] };
		}
		
		if (parsed.allowed === false) {
			return {
				allowed: false,
				reasons: Array.isArray(parsed.reasons) ? parsed.reasons : ["Inappropriate content detected"],
			};
		}
		
		return {
			allowed: Boolean(parsed.allowed),
			reasons: Array.isArray(parsed.reasons) ? parsed.reasons : [],
		};
    } catch (e) {
        console.error("Moderation error:", e.message);
        console.error("Full error:", e);
        
        if (e.message && e.message.includes("not found")) {
            console.log("Model not found, trying gemini-2.5-flash as fallback...");
            try {
                const fallbackModel = genAI.getGenerativeModel({ 
                    model: "gemini-2.5-flash",
                    safetySettings: [
                        {
                            category: "HARM_CATEGORY_HARASSMENT",
                            threshold: "BLOCK_MEDIUM_AND_ABOVE"
                        },
                        {
                            category: "HARM_CATEGORY_HATE_SPEECH",
                            threshold: "BLOCK_MEDIUM_AND_ABOVE"
                        },
                        {
                            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                            threshold: "BLOCK_MEDIUM_AND_ABOVE"
                        },
                        {
                            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                            threshold: "BLOCK_MEDIUM_AND_ABOVE"
                        }
                    ]
                });
                const fallbackResult = await fallbackModel.generateContent({ contents: [{ role: "user", parts: prompt }] });
                const text = fallbackResult.response.text() || "";
                let parsed;
                try {
                    parsed = JSON.parse(text);
                } catch {
                    const match = text.match(/\{[\s\S]*\}/);
                    parsed = match ? JSON.parse(match[0]) : { allowed: true, reasons: [] };
                }
                return {
                    allowed: Boolean(parsed.allowed),
                    reasons: Array.isArray(parsed.reasons) ? parsed.reasons : [],
                };
            } catch (fallbackError) {
                console.error("Fallback model also failed:", fallbackError.message);
            }
        }
    
        return { allowed: true, reasons: ["Moderation skipped: service unavailable"] };
    }
}


