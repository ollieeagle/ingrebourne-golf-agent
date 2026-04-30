import { NextResponse } from "next/server";
import { cookies } from "next/headers";

interface GmailMessage {
  id: string;
  threadId: string;
}

interface GmailMessageDetail {
  id: string;
  snippet: string;
  internalDate: string;
  labelIds: string[];
  payload: {
    headers: Array<{ name: string; value: string }>;
  };
}

interface TokenResponse {
  access_token: string;
  expires_in: number;
}

async function refreshAccessToken(refreshToken: string): Promise<string | null> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) return null;

  try {
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
    });

    if (!response.ok) return null;

    const data: TokenResponse = await response.json();
    return data.access_token;
  } catch {
    return null;
  }
}

function getHeader(headers: Array<{ name: string; value: string }>, name: string): string {
  const header = headers.find((h) => h.name.toLowerCase() === name.toLowerCase());
  return header?.value || "";
}

function parseFromHeader(from: string): { name: string; address: string } {
  const match = from.match(/^(.+?)\s*<(.+?)>$/);
  if (match) {
    return { name: match[1].trim().replace(/^"|"$/g, ""), address: match[2] };
  }
  return { name: from, address: from };
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    let accessToken = cookieStore.get("gmail_access_token")?.value;
    const refreshToken = cookieStore.get("gmail_refresh_token")?.value;

    if (!accessToken && refreshToken) {
      const newToken = await refreshAccessToken(refreshToken);
      if (newToken) {
        accessToken = newToken;
      }
    }

    if (!accessToken) {
      return NextResponse.json(
        { error: "Not authenticated. Please connect your Gmail account.", needsAuth: true },
        { status: 401 }
      );
    }

    // Fetch message list
    const listResponse = await fetch(
      "https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=20&labelIds=INBOX",
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!listResponse.ok) {
      if (listResponse.status === 401 && refreshToken) {
        const newToken = await refreshAccessToken(refreshToken);
        if (newToken) {
          // Retry with new token
          const retryResponse = await fetch(
            "https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=20&labelIds=INBOX",
            { headers: { Authorization: `Bearer ${newToken}` } }
          );
          if (!retryResponse.ok) {
            return NextResponse.json(
              { error: "Failed to fetch emails", needsAuth: true },
              { status: 401 }
            );
          }
        }
      }
      return NextResponse.json(
        { error: "Failed to fetch emails", needsAuth: true },
        { status: listResponse.status }
      );
    }

    const listData = await listResponse.json();
    const messages: GmailMessage[] = listData.messages || [];

    // Fetch details for each message
    const emailPromises = messages.slice(0, 20).map(async (msg) => {
      const detailResponse = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      if (!detailResponse.ok) return null;

      const detail: GmailMessageDetail = await detailResponse.json();
      const fromHeader = getHeader(detail.payload.headers, "From");
      const parsed = parseFromHeader(fromHeader);

      return {
        id: detail.id,
        subject: getHeader(detail.payload.headers, "Subject") || "(No subject)",
        from: {
          emailAddress: {
            name: parsed.name,
            address: parsed.address,
          },
        },
        receivedDateTime: new Date(parseInt(detail.internalDate)).toISOString(),
        bodyPreview: detail.snippet,
        isRead: !detail.labelIds.includes("UNREAD"),
      };
    });

    const emails = (await Promise.all(emailPromises)).filter(Boolean);

    return NextResponse.json({ emails });
  } catch (error) {
    console.error("Email fetch error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch emails" },
      { status: 500 }
    );
  }
}
