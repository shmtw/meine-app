import { NextResponse } from "next/server";
import * as XLSX from "xlsx";

export const dynamic = "force-dynamic";

type LagerRow = {
  "Sattel-NR": string | number;
  Datum: string | Date;
  Art: string;
  Sattlerei: string;
  "Order No": string | number;
  Baum: string | number;
  verkauft: string;
  sonstiges: string;
};

export async function GET() {
  try {
    const tenantId = process.env.MS_TENANT_ID;
    const clientId = process.env.MS_CLIENT_ID;
    const clientSecret = process.env.MS_CLIENT_SECRET;

    if (!tenantId || !clientId || !clientSecret) {
      throw new Error("Microsoft Umgebungsvariablen fehlen");
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
        cache: "no-store",
      }
    );

    if (!tokenResponse.ok) {
      throw new Error("Microsoft-Anmeldung fehlgeschlagen");
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    const driveId =
      "b!3OdXN1muQkW6IHNBSOD8QVY6pktruPVHt5rQ_7Slvbszo4lW4PhwT74CSi1lLSyB";

    const fileId =
      "01JJFGA2B73QAEJFJVIJCJHZZOIUSDOZMA";

    // Lagerliste aus SharePoint laden
    const fileResponse = await fetch(
      `https://graph.microsoft.com/v1.0/drives/${driveId}/items/${fileId}/content`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        cache: "no-store",
      }
    );

    if (!fileResponse.ok) {
      throw new Error(
        `Lagerliste konnte nicht geladen werden: ${await fileResponse.text()}`
      );
    }

    const arrayBuffer = await fileResponse.arrayBuffer();

    const workbook = XLSX.read(arrayBuffer, {
      type: "array",
      cellDates: true,
    });

    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    const rows = XLSX.utils.sheet_to_json<LagerRow>(worksheet, {
      defval: "",
    });

    // Nur aktuell lagernde Sättel
    const lagerbestand = rows
      .filter(
        (row) =>
          row["Sattel-NR"] &&
          String(row.verkauft).trim().toLowerCase() !== "ja"
      )
      .map((row) => ({
        sattelNr: String(row["Sattel-NR"]).trim(),
        datum:
          row.Datum instanceof Date
            ? row.Datum.toISOString()
            : String(row.Datum || ""),
        art: String(row.Art || ""),
        sattlerei: String(row.Sattlerei || ""),
        orderNo: String(row["Order No"] || ""),
        baum: String(row.Baum || ""),
        sonstiges: String(row.sonstiges || ""),
      }));

    return NextResponse.json({
      success: true,
      count: lagerbestand.length,
      saddles: lagerbestand,
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