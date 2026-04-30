import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { subject, from, body } = await request.json();

    if (!subject || !from || !body) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `You are an assistant for a Golf Operations Manager at Ingrebourne Links Golf & Country Club. Analyze this email and provide:

1. A brief summary (2-3 sentences max) highlighting the key points and any action items
2. A professional draft reply that the manager can review and send

Email Details:
From: ${from}
Subject: ${subject}
Body: ${body}

Respond in this exact JSON format (no markdown, just raw JSON):
{
  "summary": "Your summary here",
  "draftReply": "Your draft reply here starting with appropriate greeting"
}`,
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
    console.error("AI summarize error:", error);
    return NextResponse.json(
      {
        summary: "Unable to generate summary at this time.",
        draftReply: "Unable to generate reply at this time.",
      },
      { status: 200 }
    );
  }
}
