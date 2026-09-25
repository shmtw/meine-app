import { NextResponse } from "next/server";

export async function GET() {
  try {
    const tenantId = process.env.MS_TENANT_ID;
    const clientId = process.env.MS_CLIENT_ID;
    const clientSecret = process.env.MS_CLIENT_SECRET;

    if (!tenantId || !clientId || !clientSecret) {
      return NextResponse.json(
        { success: false, error: "Microsoft Umgebungsvariablen fehlen" },
        { status: 500 }
      );
    }

    // Microsoft Access Token
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
      throw new Error("Microsoft-Anmeldung fehlgeschlagen");
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Unsere bereits bekannte SharePoint-Site
    const siteId =
      "reitsattel-my.sharepoint.com,3757e7dc-ae59-4542-ba20-734148e0fc41,4ba63a56-b86b-47f5-b79a-d0ffb4a5bdbb";

    // OneDrive/Document Library der Site holen
    const driveResponse = await fetch(
      `https://graph.microsoft.com/v1.0/sites/${siteId}/drive`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!driveResponse.ok) {
      return NextResponse.json(
        {
          success: false,
          step: "drive",
          details: await driveResponse.text(),
        },
        { status: driveResponse.status }
      );
    }

    const drive = await driveResponse.json();

    // Lagerliste anhand des Pfads suchen
    const fileResponse = await fetch(
      `https://graph.microsoft.com/v1.0/drives/${drive.id}/root:/3s-Automat/Lagerf%C3%BChrung/Lagerliste_3s.xlsx`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!fileResponse.ok) {
      return NextResponse.json(
        {
          success: false,
          step: "file",
          details: await fileResponse.text(),
        },
        { status: fileResponse.status }
      );
    }

    const file = await fileResponse.json();

    return NextResponse.json({
      success: true,
      message: "Lagerliste gefunden",
      file: {
        name: file.name,
        id: file.id,
        size: file.size,
        lastModifiedDateTime: file.lastModifiedDateTime,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unbekannter Fehler",
      },
      { status: 500 }
    );
  }
}