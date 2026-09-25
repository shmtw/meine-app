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

    // Excel-Datei herunterladen
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

    // Excel lesen
    const workbook = XLSX.read(arrayBuffer, {
      type: "array",
      cellDates: true,
    });

    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    const rows = XLSX.utils.sheet_to_json<LagerRow>(worksheet, {
      defval: "",
    });

    // --------------------------------------------------
    // SICHERHEIT FÜR DEN ERSTEN SCHREIBTEST:
    // Ausschließlich Sattel 21369 darf geändert werden.
    // --------------------------------------------------
    const testSattelNr = "21369";

    const row = rows.find(
      (r) => String(r["Sattel-NR"]).trim() === testSattelNr
    );

    if (!row) {
      throw new Error(`Sattel ${testSattelNr} nicht in Excel gefunden`);
    }

    if (String(row.verkauft).trim().toLowerCase() === "ja") {
      return NextResponse.json({
        success: true,
        message: `Sattel ${testSattelNr} ist bereits als verkauft markiert`,
        geschrieben: false,
      });
    }

    // Bitrix prüfen
    const bitrixResponse = await fetch(
      `${bitrixUrl}/crm.deal.list.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          filter: {
            UF_CRM_1656582274102: testSattelNr,
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
        `Bitrix-Abfrage fehlgeschlagen: ${await bitrixResponse.text()}`
      );
    }

    const bitrixData = await bitrixResponse.json();
    const deals = bitrixData.result ?? [];

    // Kein Verkauf gefunden -> NICHT schreiben
    if (deals.length === 0) {
      return NextResponse.json({
        success: true,
        message: `Sattel ${testSattelNr} wurde in Bitrix nicht als verkauft gefunden`,
        geschrieben: false,
      });
    }

    // --------------------------------------------------
    // Richtige Excel-Zeile finden.
    // Zeile 1 = Überschriften, daher beginnen Daten bei 2.
    // --------------------------------------------------
    let excelRowNumber: number | null = null;

    const range = XLSX.utils.decode_range(worksheet["!ref"]!);

    for (let r = range.s.r + 1; r <= range.e.r; r++) {
      const cellAddress = XLSX.utils.encode_cell({
        r,
        c: 0, // Spalte A = Sattel-NR
      });

      const cell = worksheet[cellAddress];

      if (
        cell &&
        String(cell.v).trim() === testSattelNr
      ) {
        // XLSX arbeitet 0-basiert, Excel 1-basiert
        excelRowNumber = r + 1;
        break;
      }
    }

    if (excelRowNumber === null) {
      throw new Error(
        `Excel-Zeile für Sattel ${testSattelNr} konnte nicht gefunden werden`
      );
    }

    // Spalte G = verkauft
    const verkauftCell = `G${excelRowNumber}`;

    worksheet[verkauftCell] = {
      t: "s",
      v: "ja",
    };

    // Workbook wieder als XLSX erzeugen
    const output = XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
    });

    // --------------------------------------------------
    // Datei über Microsoft Graph zurück nach SharePoint
    // schreiben.
    // --------------------------------------------------
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
      throw new Error(
        `Excel-Upload fehlgeschlagen: ${await uploadResponse.text()}`
      );
    }

    const uploadedFile = await uploadResponse.json();

    return NextResponse.json({
      success: true,
      message: `Sattel ${testSattelNr} wurde auf verkauft gesetzt`,
      geschrieben: true,
      sattelNr: testSattelNr,
      excelZelle: verkauftCell,
      neuerWert: "ja",
      bitrixDealIds: deals.map(
        (deal: { ID: string }) => deal.ID
      ),
      sharePointLastModified:
        uploadedFile.lastModifiedDateTime ?? null,
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