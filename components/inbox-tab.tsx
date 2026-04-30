"use client";

import { useState } from "react";
import useSWR from "swr";
import {
  Mail,
  RefreshCw,
  ChevronRight,
  ArrowLeft,
  Send,
  Sparkles,
  Clock,
  User,
  Check,
  Copy,
} from "lucide-react";

interface Email {
  id: string;
  subject: string;
  from: {
    emailAddress: {
      name: string;
      address: string;
    };
  };
  receivedDateTime: string;
  bodyPreview: string;
  body?: {
    content: string;
  };
  isRead: boolean;
}

interface EmailWithAI extends Email {
  summary?: string;
  draftReply?: string;
  isLoadingAI?: boolean;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function InboxTab() {
  const [selectedEmail, setSelectedEmail] = useState<EmailWithAI | null>(null);
  const [copiedReply, setCopiedReply] = useState(false);

  const { data, error, isLoading, mutate } = useSWR<{ emails: Email[]; error?: string }>(
    "/api/emails",
    fetcher,
    { revalidateOnFocus: false }
  );

  const handleSelectEmail = async (email: Email) => {
    setSelectedEmail({ ...email, isLoadingAI: true });

    try {
      const response = await fetch("/api/ai/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: email.subject,
          from: email.from.emailAddress.name,
          body: email.bodyPreview,
        }),
      });

      const result = await response.json();

      setSelectedEmail((prev) =>
        prev
          ? {
              ...prev,
              summary: result.summary,
              draftReply: result.draftReply,
              isLoadingAI: false,
            }
          : null
      );
    } catch {
      setSelectedEmail((prev) =>
        prev ? { ...prev, isLoadingAI: false } : null
      );
    }
  };

  const handleCopyReply = async () => {
    if (selectedEmail?.draftReply) {
      await navigator.clipboard.writeText(selectedEmail.draftReply);
      setCopiedReply(true);
      setTimeout(() => setCopiedReply(false), 2000);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    if (hours < 48) return "Yesterday";
    return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  };

  // Email detail view
  if (selectedEmail) {
    return (
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="bg-card border-b border-border px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setSelectedEmail(null)}
            className="p-2 -ml-2 hover:bg-muted rounded-lg"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h2 className="font-semibold text-foreground truncate flex-1">
            {selectedEmail.subject}
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24">
          {/* Email metadata */}
          <div className="bg-card rounded-xl p-4 border border-border">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground">
                  {selectedEmail.from.emailAddress.name}
                </p>
                <p className="text-sm text-muted-foreground truncate">
                  {selectedEmail.from.emailAddress.address}
                </p>
                <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {formatDate(selectedEmail.receivedDateTime)}
                </div>
              </div>
            </div>
          </div>

          {/* Original email preview */}
          <div className="bg-card rounded-xl p-4 border border-border">
            <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email Content
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap">
              {selectedEmail.bodyPreview}
            </p>
          </div>

          {/* AI Summary */}
          <div className="bg-secondary rounded-xl p-4 border border-primary/20">
            <h3 className="font-semibold text-secondary-foreground mb-2 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              AI Summary
            </h3>
            {selectedEmail.isLoadingAI ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
                Analyzing email...
              </div>
            ) : (
              <p className="text-secondary-foreground text-sm leading-relaxed">
                {selectedEmail.summary || "Unable to generate summary"}
              </p>
            )}
          </div>

          {/* Draft Reply */}
          <div className="bg-card rounded-xl p-4 border border-border">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Send className="h-4 w-4 text-primary" />
                Suggested Reply
              </h3>
              {selectedEmail.draftReply && (
                <button
                  onClick={handleCopyReply}
                  className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors"
                >
                  {copiedReply ? (
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
              )}
            </div>
            {selectedEmail.isLoadingAI ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
                Drafting reply...
              </div>
            ) : (
              <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap">
                {selectedEmail.draftReply || "Unable to generate reply"}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Email list view
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-card border-b border-border px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">Inbox</h1>
        <button
          onClick={() => mutate()}
          disabled={isLoading}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
        >
          <RefreshCw
            className={`h-5 w-5 text-muted-foreground ${
              isLoading ? "animate-spin" : ""
            }`}
          />
        </button>
      </div>

      {/* Email list */}
      <div className="flex-1 overflow-y-auto pb-24">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mb-3" />
            <p className="text-muted-foreground">Loading emails...</p>
          </div>
        ) : error || data?.error ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <Mail className="h-12 w-12 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">
              {data?.error || "Failed to load emails"}
            </p>
            <button
              onClick={() => mutate()}
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium"
            >
              Try Again
            </button>
          </div>
        ) : data?.emails?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <Mail className="h-12 w-12 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No emails found</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {data?.emails?.map((email) => (
              <button
                key={email.id}
                onClick={() => handleSelectEmail(email)}
                className="w-full px-4 py-4 hover:bg-muted/50 transition-colors text-left"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      email.isRead
                        ? "bg-muted"
                        : "bg-primary/10"
                    }`}
                  >
                    <Mail
                      className={`h-5 w-5 ${
                        email.isRead
                          ? "text-muted-foreground"
                          : "text-primary"
                      }`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p
                        className={`truncate ${
                          email.isRead
                            ? "text-muted-foreground"
                            : "font-semibold text-foreground"
                        }`}
                      >
                        {email.from.emailAddress.name}
                      </p>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDate(email.receivedDateTime)}
                      </span>
                    </div>
                    <p
                      className={`truncate text-sm mt-0.5 ${
                        email.isRead
                          ? "text-muted-foreground"
                          : "text-foreground"
                      }`}
                    >
                      {email.subject}
                    </p>
                    <p className="text-sm text-muted-foreground truncate mt-1">
                      {email.bodyPreview}
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-2" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
