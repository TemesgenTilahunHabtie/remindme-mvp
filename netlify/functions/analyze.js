export async function handler(event) {
  try {
    const { url, intent } = JSON.parse(event.body);

    const prompt = `
You are an AI assistant for a TikTok intent bookmarking app.
URL: ${url}
User intent: ${intent}

Analyze the URL and user intent to fill out the requested fields.
`;

    // The structural blueprint for Gemini's output
    const responseSchema = {
      type: "OBJECT",
      properties: {
        ai_summary: { type: "STRING", description: "A short, concise summary of the bookmark and intent." },
        ai_category: { 
          type: "STRING", 
          enum: ["Cooking", "Learning", "Shopping", "Entertainment", "Finance", "Fitness", "Business", "Other"] 
        },
        intent_cluster: { type: "STRING", description: "The underlying drive (e.g., Skill Acquisition, Passive Income, Meal Prep)." },
        suggested_action: { type: "STRING", description: "One clear, actionable next step for the user." },
        priority_score: { type: "INTEGER", description: "A scale from 1 to 10 on urgency/importance based on user intent." }
      },
      required: ["ai_summary", "ai_category", "intent_cluster", "suggested_action", "priority_score"]
    };

    const response = await fetch(
      "[https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=](https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=)" +
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

    // Check if Google returned an API error
    if (data.error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: data.error.message })
      };
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!text) {
      throw new Error("Empty response from Gemini API structure.");
    }

    const parsed = JSON.parse(text);

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed)
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        ai_summary: "Failed to compile AI insight.",
        ai_category: "Other",
        intent_cluster: "Unknown",
        suggested_action: "Review manually. Error: " + error.message,
        priority_score: 1
      })
    };
  }
}