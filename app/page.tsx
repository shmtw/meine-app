"use client";

import { useState, useRef } from "react";
import SignatureCanvas from "react-signature-canvas";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export default function Page() {
  // Variablen für dropdown!!
  
  const sigRef = useRef<SignatureCanvas | null>(null);
const [sattelfarbe, setSattelfarbe] = useState("");
const [nahtfarbe, setNahtfarbe] = useState("");
const [groesse, setGroesse] = useState("");

// 2) DROPDOWNS: Hier Text + Optionen anpassen
const Dropdown = ({
  value,
  onChange,
  placeholder,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  options: string[];
}) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    style={{ width: "100%", padding: 10, marginBottom: 12 }}
  >
    <option value="">{placeholder}</option>
    {options.map((opt) => (
      <option key={opt} value={opt}>
        {opt}
      </option>
    ))}
  </select>
);





  async function generatePDF() {
    // Template laden
    const templateBytes = await fetch("/Template.pdf").then((res) =>
      res.arrayBuffer()
    );

    const pdfDoc = await PDFDocument.load(templateBytes);
    const page = pdfDoc.getPages()[0];
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    //Gitternetz für x y bestimmung

   

// Gitternetz!!!!!!!!
/*for (let x = 0; x <= width; x += 50) {
  page.drawLine({
    start: { x, y: 0 },
    end: { x, y: height },
    thickness: 0.5,
    color: rgb(0.9, 0.9, 0.9),
  });
  page.drawText(String(x), { x: x + 2, y: height - 12, size: 8, font, color: rgb(0.5,0.5,0.5) });
}

for (let y = 0; y <= height; y += 50) {
  page.drawLine({
    start: { x: 0, y },
    end: { x: width, y },
    thickness: 0.5,
    color: rgb(0.9, 0.9, 0.9),
  });
  page.drawText(String(y), { x: 2, y: y + 2, size: 8, font, color: rgb(0.5,0.5,0.5) });
}
*/
   // ab ins pdf mit der Auswahl POS!!!!!!!!!!!!
    page.drawText(sattelfarbe || "-", {
      x: 50,
      y: 800,
      size: 12,
      font
    })
    page.drawText(nahtfarbe || "-", {
      x: 50,
      y: 750,
      size: 12,
      font
    })
    page.drawText(groesse || "-", {
      x: 50,
      y: 700,
      size: 12,
      font
    })


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

// pdf gen
const safeBytes = new Uint8Array(pdfBytes.length);
safeBytes.set(pdfBytes);

const blob = new Blob([safeBytes], { type: "application/pdf" });

const url = URL.createObjectURL(blob);
const a = document.createElement("a");
a.href = url;
a.download = "Sattelbestellung.pdf";
a.click();
URL.revokeObjectURL(url);
  }

  return (
    <main style={{ padding: 30, maxWidth: 600 }}>
      <h1>Sattelbestellung</h1>

      

<>
  <Dropdown
    value={sattelfarbe}
    onChange={setSattelfarbe}
    placeholder="Sattelfarbe"
    options={["Sattelfarbe: Schwarz", "Sattelfarbe: Braun", "Sattelfarbe: Cognac"]} // <-- Optionen ändern
  />

  <Dropdown
    value={nahtfarbe}
    onChange={setNahtfarbe}
    placeholder="Nahtfarbe"
    options={["Nähte: Rot", "Nähte: Cognac", "Nähte: Gelb", "Nähte: Braun", "Nähte: Beige", "Nähte: Grau", "Nähte: Weiss", "Nähte: Schwarz", "Nähte: Kirsche", "Nähte: Hellblau", "Nähte: Grün", "Nähte: Türkis", "Nähte: Kupfer", "Nähte: Lila", "Nähte: Blau", "Nähte: Orange"
    ]} // <-- Optionen ändern
  />

  <Dropdown
    value={groesse}
    onChange={setGroesse}
    placeholder="Sitzgröße"
    options={["Sitzgröße: 16", "Sitzgröße: 16,5", "Sitzgröße: 17", "Sitzgröße: 17,5", "Sitzgröße: 18"]} // <-- Optionen ändern
  />
</>

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