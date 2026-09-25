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
    const bitrixUrl = process.env.BITRIX_WEBHOOK_URL;

    if (!tenantId || !clientId || !clientSecret) {
      throw new Error("Microsoft Umgebungsvariablen fehlen");
    }

    if (!bitrixUrl) {
      throw new Error("BITRIX_WEBHOOK_URL fehlt");
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

    // Excel herunterladen
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
        `Excel-Download fehlgeschlagen: ${await fileResponse.text()}`
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

    // Nur aktuell lagernde Sättel prüfen
    const offeneSaettel = rows.filter(
      (row) =>
        row["Sattel-NR"] &&
        String(row.verkauft).trim().toLowerCase() !== "ja"
    );

    const verkaufteSaettel: {
      sattelNr: string;
      art: string;
      dealIds: string[];
    }[] = [];

    // Jeden offenen Sattel in Bitrix prüfen
    for (const row of offeneSaettel) {
      const sattelNr = String(row["Sattel-NR"]).trim();

      const bitrixResponse = await fetch(
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

      if (!bitrixResponse.ok) {
        throw new Error(
          `Bitrix-Abfrage für Sattel ${sattelNr} fehlgeschlagen`
        );
      }

      const bitrixData = await bitrixResponse.json();
      const deals = bitrixData.result ?? [];

      if (deals.length > 0) {
        verkaufteSaettel.push({
          sattelNr,
          art: String(row.Art || ""),
          dealIds: deals.map(
            (deal: { ID: string }) => deal.ID
          ),
        });
      }
    }

    // Nichts gefunden -> Excel NICHT hochladen
    if (verkaufteSaettel.length === 0) {
      return NextResponse.json({
        success: true,
        message: "Lagerbestand ist aktuell",
        geprueft: offeneSaettel.length,
        aktualisiert: 0,
        saddles: [],
      });
    }

    // Gefundene Sättel in Excel auf "ja" setzen
    const range = XLSX.utils.decode_range(worksheet["!ref"]!);

    for (let r = range.s.r + 1; r <= range.e.r; r++) {
      const sattelCellAddress = XLSX.utils.encode_cell({
        r,
        c: 0, // Spalte A = Sattel-NR
      });

      const sattelCell = worksheet[sattelCellAddress];

      if (!sattelCell) {
        continue;
      }

      const sattelNr = String(sattelCell.v).trim();

      const wurdeVerkauft = verkaufteSaettel.some(
        (sattel) => sattel.sattelNr === sattelNr
      );

      if (wurdeVerkauft) {
        // Spalte G = verkauft
        const verkauftCellAddress = XLSX.utils.encode_cell({
          r,
          c: 6,
        });

        worksheet[verkauftCellAddress] = {
          t: "s",
          v: "ja",
        };
      }
    }

    // Excel neu erzeugen
    const output = XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
    });

    // Zurück nach SharePoint schreiben
    const uploadResponse = await fetch(
      `https://graph.microsoft.com/v1.0/drives/${driveId}/items/${fileId}/content`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        },
        body: output,
      }
    );

    if (!uploadResponse.ok) {
      const uploadError = await uploadResponse.text();

      if (
        uploadResponse.status === 423 ||
        uploadError.includes("resourceLocked")
      ) {
        throw new Error(
          "Die Lagerliste ist derzeit in Excel geöffnet. Bitte schließen und erneut versuchen."
        );
      }

      throw new Error(
        `Excel-Upload fehlgeschlagen: ${uploadError}`
      );
    }

    return NextResponse.json({
      success: true,
      message: `${verkaufteSaettel.length} verkaufte Sättel wurden aktualisiert`,
      geprueft: offeneSaettel.length,
      aktualisiert: verkaufteSaettel.length,
      saddles: verkaufteSaettel,
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