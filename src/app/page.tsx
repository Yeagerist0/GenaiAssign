"use client";

import { FormEvent, useMemo, useState } from "react";

import { ChatMessage, PERSONAS, PERSONA_LIST, PersonaId } from "@/lib/personas";

type ChatApiResponse = {
  reply?: string;
  error?: string;
};

export default function Home() {
  const [activePersonaId, setActivePersonaId] =
    useState<PersonaId>("anshuman-singh");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activePersona = useMemo(
    () => PERSONAS[activePersonaId],
    [activePersonaId],
  );

  const submitMessage = async (rawMessage: string) => {
    const cleanedMessage = rawMessage.trim();
    if (!cleanedMessage || isLoading) return;

    const nextMessages: ChatMessage[] = [
      ...messages,
      { role: "user", content: cleanedMessage },
    ];
    setMessages(nextMessages);
    setInput("");
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personaId: activePersonaId,
          messages: nextMessages,
        }),
      });

      const data = (await response.json()) as ChatApiResponse;
      if (!response.ok) {
        throw new Error(data.error ?? "Something went wrong. Please retry.");
      }

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: data.reply ?? "I could not generate a response. Try again.",
        },
      ]);
    } catch (submissionError) {
      const message =
        submissionError instanceof Error
          ? submissionError.message
          : "Could not connect to the AI service.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await submitMessage(input);
  };

  const switchPersona = (personaId: PersonaId) => {
    if (isLoading || personaId === activePersonaId) return;
    setActivePersonaId(personaId);
    setMessages([]);
    setError(null);
    setInput("");
  };

  return (
    <div className="min-h-screen bg-slate-950 px-3 py-4 text-slate-100 sm:px-6 sm:py-6">
      <main className="mx-auto flex h-[calc(100vh-2rem)] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl sm:h-[calc(100vh-3rem)]">
        <header className="border-b border-slate-800 p-4 sm:p-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h1 className="text-lg font-semibold sm:text-2xl">
              Persona-Based AI Chatbot
            </h1>
            <span className="rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-medium text-indigo-200 sm:text-sm">
              Active Persona: {activePersona.name}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {PERSONA_LIST.map((persona) => {
              const isActive = activePersona.id === persona.id;
              return (
                <button
                  key={persona.id}
                  type="button"
                  onClick={() => switchPersona(persona.id)}
                  disabled={isLoading}
                  className={`rounded-xl border px-4 py-3 text-left transition ${
                    isActive
                      ? "border-indigo-400 bg-indigo-500/20"
                      : "border-slate-700 bg-slate-800 hover:border-slate-500"
                  }`}
                >
                  <p className="text-sm font-semibold">{persona.name}</p>
                  <p className="mt-1 text-xs text-slate-300">{persona.roleLine}</p>
                </button>
              );
            })}
          </div>

          <div className="mt-3">
            <p className="text-xs text-slate-400">{activePersona.voiceSummary}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {activePersona.suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => submitMessage(suggestion)}
                  disabled={isLoading}
                  className="rounded-full border border-slate-700 bg-slate-800 px-3 py-1 text-xs text-slate-200 transition hover:border-slate-500"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </header>

        <section className="flex-1 overflow-y-auto p-4 sm:p-6">
          {messages.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-700 bg-slate-800/50 p-4 text-sm text-slate-300">
              Start a conversation with {activePersona.name}. Switching personas
              resets the conversation by design.
            </div>
          )}

          <div className="space-y-4">
            {messages.map((message, index) => {
              const isUser = message.role === "user";
              return (
                <div
                  key={`${message.role}-${index}`}
                  className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-relaxed sm:max-w-[80%] ${
                      isUser
                        ? "bg-indigo-500 text-white"
                        : "border border-slate-700 bg-slate-800 text-slate-100"
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex justify-start">
                <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-slate-300">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.3s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.15s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" />
                  <span>{activePersona.name} is typing...</span>
                </div>
              </div>
            )}
          </div>
        </section>

        <footer className="border-t border-slate-800 p-4 sm:p-5">
          {error && (
            <p className="mb-3 rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {error}
            </p>
          )}

          <form onSubmit={onSubmit} className="flex gap-2">
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder={`Ask ${activePersona.name} anything...`}
              disabled={isLoading}
              className="flex-1 rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm outline-none ring-indigo-400 placeholder:text-slate-500 focus:ring-2"
            />
            <button
              type="submit"
              disabled={isLoading || input.trim().length === 0}
              className="rounded-xl bg-indigo-500 px-5 py-3 text-sm font-medium text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:bg-indigo-700/60"
            >
              Send
            </button>
          </form>
        </footer>
      </main>
    </div>
  );
}
