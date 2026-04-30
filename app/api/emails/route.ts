import { NextResponse } from "next/server";

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface GraphEmail {
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
  isRead: boolean;
}

interface GraphResponse {
  value: GraphEmail[];
}

async function getAccessToken(): Promise<string> {
  const tenantId = process.env.AZURE_TENANT_ID;
  const clientId = process.env.AZURE_CLIENT_ID;
  const clientSecret = process.env.AZURE_CLIENT_SECRET;

  if (!tenantId || !clientId || !clientSecret) {
    throw new Error("Missing Azure credentials");
  }

  const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;

  const params = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    scope: "https://graph.microsoft.com/.default",
    grant_type: "client_credentials",
  });

  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get access token: ${error}`);
  }

  const data: TokenResponse = await response.json();
  return data.access_token;
}

export async function GET() {
  try {
    const outlookEmail = process.env.OUTLOOK_EMAIL;

    if (!outlookEmail) {
      return NextResponse.json(
        { error: "OUTLOOK_EMAIL not configured" },
        { status: 500 }
      );
    }

    const accessToken = await getAccessToken();

    const graphUrl = `https://graph.microsoft.com/v1.0/users/${outlookEmail}/messages?$top=20&$orderby=receivedDateTime desc&$select=id,subject,from,receivedDateTime,bodyPreview,isRead`;

    const response = await fetch(graphUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Graph API error:", error);
      return NextResponse.json(
        { error: "Failed to fetch emails from Microsoft Graph" },
        { status: response.status }
      );
    }

    const data: GraphResponse = await response.json();

    return NextResponse.json({ emails: data.value });
  } catch (error) {
    console.error("Email fetch error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch emails" },
      { status: 500 }
    );
  }
}
