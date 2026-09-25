import { NextResponse } from "next/server";
import * as XLSX from "xlsx";

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

    // Microsoft Access Token holen
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

    // Bekannte SharePoint-Datei
    const driveId =
      "b!3OdXN1muQkW6IHNBSOD8QVY6pktruPVHt5rQ_7Slvbszo4lW4PhwT74CSi1lLSyB";

    const fileId =
      "01JJFGA2B73QAEJFJVIJCJHZZOIUSDOZMA";

    // Excel-Datei herunterladen
    const fileResponse = await fetch(
      `https://graph.microsoft.com/v1.0/drives/${driveId}/items/${fileId}/content`,
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
          step: "download",
          details: await fileResponse.text(),
        },
        { status: fileResponse.status }
      );
    }

    const arrayBuffer = await fileResponse.arrayBuffer();

    // Excel lesen
    const workbook = XLSX.read(arrayBuffer, {
      type: "array",
      cellDates: true,
    });

    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    const rows = XLSX.utils.sheet_to_json(worksheet, {
      defval: "",
    });

    return NextResponse.json({
      success: true,
      message: "Lagerliste gelesen",
      sheet: sheetName,
      count: rows.length,
      rows,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unbekannter Fehler",
      },
      { status: 500 }
    );
  }
}