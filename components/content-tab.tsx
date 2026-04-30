"use client";

import { useState } from "react";
import {
  Sparkles,
  Instagram,
  Twitter,
  Globe,
  Copy,
  Check,
  ImageIcon,
  Hash,
  MessageSquare,
  Loader2,
} from "lucide-react";

type Platform = "instagram" | "twitter" | "facebook";
type ContentType = "event" | "promotion" | "update" | "weather" | "membership";

const platforms: { id: Platform; label: string; icon: typeof Instagram }[] = [
  { id: "instagram", label: "Instagram", icon: Instagram },
  { id: "twitter", label: "Twitter", icon: Twitter },
  { id: "facebook", label: "Facebook", icon: Globe },
];

const contentTypes: { id: ContentType; label: string }[] = [
  { id: "event", label: "Event" },
  { id: "promotion", label: "Promotion" },
  { id: "update", label: "Club Update" },
  { id: "weather", label: "Weather/Course" },
  { id: "membership", label: "Membership" },
];

interface GeneratedContent {
  caption: string;
  hashtags: string[];
  imagePrompt: string;
}

export function ContentTab() {
  const [platform, setPlatform] = useState<Platform>("instagram");
  const [contentType, setContentType] = useState<ContentType>("event");
  const [topic, setTopic] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [content, setContent] = useState<GeneratedContent | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!topic.trim()) return;

    setIsGenerating(true);
    setContent(null);

    try {
      const response = await fetch("/api/ai/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform, contentType, topic }),
      });

      const result = await response.json();
      setContent(result);
    } catch {
      setContent(null);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-card border-b border-border px-4 py-3">
        <h1 className="text-xl font-bold text-foreground">Content Creator</h1>
        <p className="text-sm text-muted-foreground">
          Generate social media content with AI
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24">
        {/* Platform selector */}
        <div className="bg-card rounded-xl p-4 border border-border">
          <label className="text-sm font-medium text-foreground mb-3 block">
            Platform
          </label>
          <div className="flex gap-2">
            {platforms.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setPlatform(id)}
                className={`flex-1 flex flex-col items-center gap-2 py-3 rounded-lg border transition-colors ${
                  platform === id
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/50"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs font-medium">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content type selector */}
        <div className="bg-card rounded-xl p-4 border border-border">
          <label className="text-sm font-medium text-foreground mb-3 block">
            Content Type
          </label>
          <div className="flex flex-wrap gap-2">
            {contentTypes.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setContentType(id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  contentType === id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Topic input */}
        <div className="bg-card rounded-xl p-4 border border-border">
          <label
            htmlFor="topic"
            className="text-sm font-medium text-foreground mb-3 block"
          >
            Topic or Details
          </label>
          <textarea
            id="topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="E.g., Weekend golf tournament, 20% off memberships, course maintenance complete..."
            rows={3}
            className="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          />
        </div>

        {/* Generate button */}
        <button
          onClick={handleGenerate}
          disabled={!topic.trim() || isGenerating}
          className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5" />
              Generate Content
            </>
          )}
        </button>

        {/* Generated content */}
        {content && (
          <div className="space-y-4">
            {/* Caption */}
            <div className="bg-secondary rounded-xl p-4 border border-primary/20">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-secondary-foreground flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  Caption
                </h3>
                <button
                  onClick={() => handleCopy(content.caption, "caption")}
                  className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors"
                >
                  {copiedField === "caption" ? (
                    <>
                      <Check className="h-4 w-4" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy
                    </>
                  )}
                </button>
              </div>
              <p className="text-secondary-foreground text-sm leading-relaxed whitespace-pre-wrap">
                {content.caption}
              </p>
            </div>

            {/* Hashtags */}
            <div className="bg-card rounded-xl p-4 border border-border">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Hash className="h-4 w-4 text-primary" />
                  Hashtags
                </h3>
                <button
                  onClick={() =>
                    handleCopy(content.hashtags.join(" "), "hashtags")
                  }
                  className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors"
                >
                  {copiedField === "hashtags" ? (
                    <>
                      <Check className="h-4 w-4" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy
                    </>
                  )}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {content.hashtags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Image prompt */}
            <div className="bg-card rounded-xl p-4 border border-border">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-primary" />
                  Image Prompt
                </h3>
                <button
                  onClick={() => handleCopy(content.imagePrompt, "image")}
                  className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors"
                >
                  {copiedField === "image" ? (
                    <>
                      <Check className="h-4 w-4" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy
                    </>
                  )}
                </button>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {content.imagePrompt}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
