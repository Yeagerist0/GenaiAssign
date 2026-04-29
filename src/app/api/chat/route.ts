import OpenAI from "openai";
import { NextResponse } from "next/server";

import { ChatMessage, PERSONAS, PersonaId } from "@/lib/personas";

type ChatRequestBody = {
  personaId?: PersonaId;
  messages?: ChatMessage[];
};

const MODEL = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

function isValidMessage(message: ChatMessage) {
  return (
    (message.role === "user" || message.role === "assistant") &&
    typeof message.content === "string" &&
    message.content.trim().length > 0
  );
}

export async function POST(request: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "Server configuration missing: OPENAI_API_KEY." },
      { status: 500 },
    );
  }

  let body: ChatRequestBody;
  try {
    body = (await request.json()) as ChatRequestBody;
  } catch {
    return NextResponse.json(
      { error: "Invalid request body. Please retry." },
      { status: 400 },
    );
  }

  const personaId = body.personaId;
  const messages = body.messages ?? [];
  const persona = personaId ? PERSONAS[personaId] : undefined;

  if (!persona) {
    return NextResponse.json(
      { error: "Invalid persona selected." },
      { status: 400 },
    );
  }

  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json(
      { error: "Please send at least one user message." },
      { status: 400 },
    );
  }

  if (!messages.every(isValidMessage)) {
    return NextResponse.json(
      { error: "Message format is invalid." },
      { status: 400 },
    );
  }

  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  try {
    const completion = await client.chat.completions.create({
      model: MODEL,
      temperature: 0.7,
      messages: [
        { role: "system", content: persona.systemPrompt },
        ...messages.map((message) => ({
          role: message.role,
          content: message.content,
        })),
      ],
    });

    const reply = completion.choices[0]?.message?.content?.trim();
    if (!reply) {
      return NextResponse.json(
        { error: "No response received from model. Please try again." },
        { status: 502 },
      );
    }

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "The AI service is temporarily unavailable. Please try again." },
      { status: 500 },
    );
  }
}
