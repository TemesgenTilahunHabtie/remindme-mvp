export async function handler(event) {
  try {
    const { url, intent } = JSON.parse(event.body);

    const prompt = `
You are an expert AI assistant for a TikTok intent bookmarking app called RemindMe.
Analyze the following bookmark:
TikTok URL: ${url}
User's Intent: ${intent}

Provide a summary, categorize it, find the deeper psychological intent cluster, suggest an action, and assign a priority score.
`;

    const responseSchema = {
      type: "object",
      properties: {
        ai_summary: { type: "string" },
        ai_category: { type: "string" },
        intent_cluster: { type: "string" },
        suggested_action: { type: "string" },
        priority_score: { type: "integer" }
      },
      required: ["ai_summary", "ai_category", "intent_cluster", "suggested_action", "priority_score"]
    };

    // FIXED: Changed model to gemini-1.5-flash-latest to align with the v1beta endpoint routing requirements
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=" +
      process.env.REMINDE_ME_GEMINI_API_KEY,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: responseSchema
          }
        })
      }
    );

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!text) {
      throw new Error("Gemini returned an empty content payload.");
    }

    const aiResult = JSON.parse(text);

    const cleanOutput = {
      ai_summary: aiResult.ai_summary || "No summary generated.",
      ai_category: aiResult.ai_category || "Other",
      intent_cluster: aiResult.intent_cluster || "General",
      suggested_action: aiResult.suggested_action || "Review item manually.",
      priority_score: aiResult.priority_score || 5
    };

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cleanOutput)
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ai_summary: "Could not compile AI analysis automatically.",
        ai_category: "Other",
        intent_cluster: "Unknown",
        suggested_action: "Error encountered: " + error.message,
        priority_score: 1
      })
    };
  }
}