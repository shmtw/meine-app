"use client";

import { useState, useRef } from "react";
import SignatureCanvas from "react-signature-canvas";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export default function Page() {
  const [farbe, setFarbe] = useState("");
  const sigRef = useRef<SignatureCanvas | null>(null);

  async function generatePDF() {
    // Template laden
    const templateBytes = await fetch("/template.pdf").then((res) =>
      res.arrayBuffer()
    );

    const pdfDoc = await PDFDocument.load(templateBytes);
    const page = pdfDoc.getPages()[0];
    const { width, height } = page.getSize();

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // 🔹 Dropdown-Wert ins PDF schreiben
    page.drawText(farbe || "-", {
      x: 180, // anpassen falls nötig
      y: 520, // anpassen falls nötig
      size: 12,
      font,
      color: rgb(0, 0, 0),
    });

    // 🔹 Unterschrift unten rechts
    if (sigRef.current && !sigRef.current.isEmpty()) {
      const dataUrl =
        sigRef.current.getTrimmedCanvas().toDataURL("image/png");

      const base64 = dataUrl.split(",")[1];
      const pngImage = await pdfDoc.embedPng(base64);

      const sigWidth = 160;
      const sigHeight =
        (pngImage.height / pngImage.width) * sigWidth;

      const x = width - sigWidth - 40; // 40px Rand rechts
      const y = 40; // 40px Rand unten

      page.drawImage(pngImage, {
        x,
        y,
        width: sigWidth,
        height: sigHeight,
      });
    }

 // PDF speichern
const pdfBytes = await pdfDoc.save();

// ✅ TS-safe: Bytes in ein "normales" Uint8Array kopieren (ArrayBuffer, kein SharedArrayBuffer-Union)
const safeBytes = new Uint8Array(pdfBytes.length);
safeBytes.set(pdfBytes);

const blob = new Blob([safeBytes], { type: "application/pdf" });

const url = URL.createObjectURL(blob);
const a = document.createElement("a");
a.href = url;
a.download = "ausgefuellt.pdf";
a.click();
URL.revokeObjectURL(url);
  }

  return (
    <main style={{ padding: 30, maxWidth: 600 }}>
      <h1>Bestellformular</h1>

      {/* Dropdown Sattelfarbe */}
      <select
        value={farbe}
        onChange={(e) => setFarbe(e.target.value)}
        style={{
          width: "100%",
          padding: 10,
          marginBottom: 20,
        }}
      >
        <option value="">Sattelfarbe auswählen</option>
        <option value="Schwarz">Schwarz</option>
        <option value="Braun">Braun</option>
        <option value="Natur">Natur</option>
      </select>

      {/* Unterschrift */}
      <div style={{ marginBottom: 20 }}>
        <p>Unterschrift:</p>

        <SignatureCanvas
          ref={sigRef}
          penColor="black"
          canvasProps={{
            width: 500,
            height: 150,
            style: {
              width: "100%",
              border: "1px solid #000",
              background: "#fff",
            },
          }}
        />

        <button
          type="button"
          onClick={() => sigRef.current?.clear()}
          style={{ marginTop: 8 }}
        >
          Unterschrift löschen
        </button>
      </div>

      {/* PDF Button */}
      <button
        onClick={generatePDF}
        style={{
          padding: "12px 18px",
          fontSize: 16,
        }}
      >
        PDF speichern
      </button>
    </main>
  );
}