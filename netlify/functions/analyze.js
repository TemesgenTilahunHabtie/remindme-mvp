export async function handler(event) {

  const { url, intent } = JSON.parse(event.body);

  const prompt = `
You are an AI assistant for a TikTok "Intent Bookmarking" app.

User saved a TikTok video.

URL: ${url}
User intent: ${intent}

Do 4 things:

1. Write a short 1–2 sentence summary of what this video is likely about.
2. Categorize it into ONE of: Cooking, Learning, Shopping, Entertainment, Finance, Fitness, Business, Other.
3. Detect the deeper "intent cluster" (examples: self-improvement, money-making, lifestyle upgrade, curiosity, productivity, entertainment addiction).
4. Suggest ONE actionable next step the user should take.

Return ONLY valid JSON in this format:
{
  "ai_summary": "",
  "ai_category": "",
  "intent_cluster": "",
  "suggested_action": "",
  "priority_score": 1-10
}
`;

  const response = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" +
      process.env.GEMINI_API_KEY,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ]
      })
    }
  );

  const data = await response.json();

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch (e) {
    parsed = {
      ai_summary: text,
      ai_category: "Other",
      intent_cluster: "Unknown",
      suggested_action: "Review manually",
      priority_score: 5
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify(parsed)
  };
}