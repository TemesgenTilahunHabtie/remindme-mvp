exports.handler = async function (event) {
  try {
    const body = JSON.parse(event.body || "{}");
    const userIntent = body.intent || "";
    const url = body.url || "";

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({
        url,
        userIntent,

        ai_summary:
          "This video appears to be related to: " + userIntent,

        ai_category: "Learning",

        intent_cluster: "Build Online Business",

        suggested_action:
          "Break this into a small actionable step and try it this week.",

        priority_score: 7,

        keywords: [
          "AI",
          "learning",
          "action",
          "growth"
        ]
      })
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: err.message
      })
    };
  }
};