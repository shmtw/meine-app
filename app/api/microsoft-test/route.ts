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

  // 1. Access Token holen
  const tokenResponse = await fetch(
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

  if (!tokenResponse.ok) {
    return NextResponse.json(
      {
        success: false,
        error: "Microsoft-Anmeldung fehlgeschlagen",
        details: await tokenResponse.text(),
      },
      { status: 500 }
    );
  }

  const tokenData = await tokenResponse.json();
  const accessToken = tokenData.access_token;

  // 2. Unsere bekannte SharePoint-Site abfragen
  const siteResponse = await fetch(
    "https://graph.microsoft.com/v1.0/sites/reitsattel-my.sharepoint.com:/personal/info_3s-sattel_at",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  const siteData = await siteResponse.json();

  if (!siteResponse.ok) {
    return NextResponse.json(
      {
        success: false,
        message: "Microsoft-Anmeldung funktioniert, Site-Zugriff aber noch nicht",
        graphStatus: siteResponse.status,
        details: siteData,
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    message: "SharePoint-Site gefunden",
    site: {
      id: siteData.id,
      name: siteData.name,
      webUrl: siteData.webUrl,
    },
  });
}