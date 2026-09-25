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

const rows = XLSX.utils.sheet_to_json<LagerRow>(worksheet, {
  defval: "",
});
const bitrixUrl = process.env.BITRIX_WEBHOOK_URL;

if (!bitrixUrl) {
  throw new Error("BITRIX_WEBHOOK_URL fehlt");
}

// Nur Sättel prüfen, die in Excel noch NICHT verkauft sind
const offeneSaettel = rows.filter(
  (row) =>
    row["Sattel-NR"] &&
    String(row.verkauft).trim().toLowerCase() !== "ja"
);

const ergebnis = [];

for (const row of offeneSaettel) {
  const sattelNr = String(row["Sattel-NR"]).trim();

  const response = await fetch(
    `${bitrixUrl}/crm.deal.list.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        filter: {
          UF_CRM_1656582274102: sattelNr,
          UF_CRM_1656399545855: "1052",
        },
        select: [
          "ID",
          "TITLE",
          "UF_CRM_1656582274102",
          "UF_CRM_1656399545855",
        ],
      }),
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(
      `Bitrix-Abfrage für Sattel ${sattelNr} fehlgeschlagen`
    );
  }

  const data = await response.json();
  const deals = data.result ?? [];

  ergebnis.push({
    sattelNr,
    art: row.Art,
    excelVerkauft: row.verkauft || "",
    bitrixVerkauft: deals.length > 0,
    dealIds: deals.map((deal: { ID: string }) => deal.ID),
    aktion:
      deals.length > 0
        ? 'würde auf "ja" gesetzt'
        : "keine Änderung",
  });
}

    return NextResponse.json({
  success: true,
  message: "Lagerabgleich Dry-Run abgeschlossen",
  lagerZeilen: rows.length,
  geprueft: offeneSaettel.length,
  ergebnis,
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