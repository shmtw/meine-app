import { NextResponse } from "next/server";

export async function GET() {
  const tenantId = process.env.MS_TENANT_ID;
  const clientId = process.env.MS_CLIENT_ID;
  const clientSecret = process.env.MS_CLIENT_SECRET;

  if (!tenantId || !clientId || !clientSecret) {
    return NextResponse.json(
      { success: false, error: "Microsoft Umgebungsvariablen fehlen" },
      { status: 500 }
    );
  }

  const response = await fetch(
    `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        scope: "https://graph.microsoft.com/.default",
        grant_type: "client_credentials",
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();

    return NextResponse.json(
      {
        success: false,
        error: "Microsoft-Anmeldung fehlgeschlagen",
        details: error,
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    message: "Microsoft-Anmeldung funktioniert",
  });
}