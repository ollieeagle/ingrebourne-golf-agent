import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { platform, contentType, topic } = await request.json();

    if (!platform || !contentType || !topic) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const platformGuidelines = {
      instagram: "Instagram post (max 2200 chars, engaging, visual-focused)",
      twitter: "Twitter/X post (max 280 chars, punchy, conversational)",
      facebook: "Facebook post (medium length, community-focused, shareable)",
    };

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `You are a social media manager for Ingrebourne Links Golf & Country Club, a premier golf destination. Create engaging content for the following:

Platform: ${platformGuidelines[platform as keyof typeof platformGuidelines]}
Content Type: ${contentType}
Topic/Details: ${topic}

Generate:
1. An engaging caption appropriate for the platform
2. 5-8 relevant hashtags (include #IngrebourneLinks #GolfLife)
3. An AI image generation prompt for a accompanying photo

Respond in this exact JSON format (no markdown, just raw JSON):
{
  "caption": "Your caption here",
  "hashtags": ["#hashtag1", "#hashtag2", "#hashtag3"],
  "imagePrompt": "Detailed image prompt for AI generation"
}

Make the content professional yet engaging, reflecting a quality golf club atmosphere.`,
        },
      ],
    });

    const textContent = message.content.find((c) => c.type === "text");
    if (!textContent || textContent.type !== "text") {
      throw new Error("No text response from Claude");
    }

    const result = JSON.parse(textContent.text);

    return NextResponse.json(result);
  } catch (error) {
    console.error("AI content error:", error);
    return NextResponse.json(
      {
        caption: "Unable to generate content at this time.",
        hashtags: ["#IngrebourneLinks", "#GolfLife"],
        imagePrompt: "Unable to generate image prompt.",
      },
      { status: 200 }
    );
  }
}
