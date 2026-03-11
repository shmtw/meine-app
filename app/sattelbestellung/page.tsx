
"use client";

import { useState, useRef } from "react";
import SignatureCanvas from "react-signature-canvas";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import Image from "next/image"

export default function Page() {
  // Variablen für dropdown!!
  
const sigRef = useRef<SignatureCanvas | null>(null);
const [sattelfarbe, setSattelfarbe] = useState("");
const [nahtfarbe, setNahtfarbe] = useState("");
const [groesse, setGroesse] = useState("");
const [keder, setKeder] = useState("");
//const [model, setModel] = useState("");
const [sattelbaum, setSattelbaum] = useState("");
const [efter, setEfter] = useState("");
const [spiegelart, setSpiegelart] = useState("");
const [spiegelfarbe, setSpiegelfarbe] = useState("");
const [zubusseart, setZubusseart] = useState("");
const [zubussefarbe, setZubussfarbe] = useState("");
const [vorschnitt, setVorschnitt] = useState("");
const [sattelblatt, setSattelblatt] = useState("");
const [pauschentasche, setPauschentasche] = useState("");
//const [pauschetyp, setPauschetyp] = useState("");
const [kissentyp, setKissentyp] = useState("");
const [kissenlaenge, setKissenlaenge] = useState("");
const [kissenkeder, setKissenkeder] = useState("");
const [mono,setMono] = useState("");
//const [michael, setMichael] = useState("");

const [steine, SetSteine] = useState("");
const [kommentar, setKommentar] = useState("");
const [zubehör, SetZubehör] = useState("");
const [name, SetName] = useState("");
const [preis, SetPreis] = useState("");
const [anzahlung, SetAnzahlung] = useState("");
const [straße, SetStraße] = useState("");
const [plz, SetPlz] = useState("");
const [tel, SetTel] =useState("");
const [mail, SetMail] = useState("");
const [packringe, SetPackringe] = useState("");
const [pdfPreviewUrl, setPdfPreviewUrl] = useState("");
const [showPreview, setShowPreview] = useState(false);


//Test dynamic

const [modell, setModell] = useState("");
const [pausche, setPausche] = useState("");

// Modelle -> Pausche-Optionen
const pauscheByModell: Record<string, string[]> = {
  "Bentley St. Michael": ["Standard", "Pausche hochgesetzt", "Pausche zurück gesetzt"],
  "Bentley St. Florian": ["Standard", "Pausche: D18","Pausche: D11","Pausche: D02", "Pausche: D03"],
  "Bentley Performence": ["Standard", "Pausche: D18","Pausche: D11","Pausche: D02", "Pausche: D03"],
  "Endurance": ["Standard", "Pausche: D18","Pausche: D11","Pausche: D02", "Pausche: D03", "Pausche: Ice09", "Pausche: j01", "Pausche: j07", "Pausche: j10", "Pausche: j06", "Pausche: j20"],
  "Icelandic": ["Standard", "Pausche: D18","Pausche: D11","Pausche: D02", "Pausche: D03", "Pausche: Ice09", "Pausche: j01", "Pausche: j07", "Pausche: j10", "Pausche: j06", "Pausche: j20"],
  "FSA Dressur": ["Standard"],
  "FSA Springer": ["Standard"],
  "FSA Vielseitigkeit": ["Standard"],
  "FSA Icelandic": ["Standard"],
  "Cayenne Classic": ["Standard", "Pausche: j01", "Pausche: j07", "Pausche: j10", "Pausche: j06", "Pausche: j20"],
  "Cayenne Offroad": ["Standard", "Pausche: j01", "Pausche: j07", "Pausche: j10", "Pausche: j06", "Pausche: j20"],
};
const pauscheOptions = pauscheByModell[modell] ?? [];





// 2)
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
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
   

// Gitternetz!!!!!!!!
/*
for (let x = 0; x <= width; x += 50) {
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
      x: 250,
      y: 600,
      size: 10,
      font
    })
    //check
    page.drawText(nahtfarbe || "-", {
      x: 400,
      y: 600,
      size: 10,
      font
    })
    //check
    page.drawText(groesse || "-", {
      x: 190,
      y: 583,
      size: 10,
      font
    })
    //check
    page.drawText(keder || "-",{
      x: 425,
      y: 475,
      size: 10,
      font
    })
    //check 
    page.drawText(modell || "-",{
      x: 104,
      y: 600,
      size: 10,
      font: fontBold
    })
    //cjecl 
    page.drawText(sattelbaum || "-",{
      x: 50,
      y: 600,
      size: 10,
      font: fontBold
    })
    page.drawText(efter || "-",{
      x: 300,
      y: 583,
      size: 10,
      font
    })
    page.drawText(spiegelart || "-",{
      x: 425,
      y: 560,
      size: 10,
      font
    })
    page.drawText(spiegelfarbe || "-",{
      x: 425,
      y: 548,
      size: 10,
      font
    })
    page.drawText(zubusseart || "-",{
      x: 425,
      y: 530,
      size: 10,
      font
    })
    page.drawText(zubussefarbe || "-",{
      x: 425,
      y: 518,
      size: 10,
      font
    })
    page.drawText(zubusseart || "-",{
      x: 100,
      y: 467,
      size: 10,
      font
    })
    page.drawText(zubussefarbe || "-",{
      x: 100,
      y: 455,
      size: 10,
      font
    })
    page.drawText(vorschnitt || "-",{
      x: 100,
      y: 550,
      size: 10,
      font
    })
    page.drawText(sattelblatt || "-",{
      x: 425,
      y: 400,
      size: 10,
      font
    })
    page.drawText(pauschentasche || "-",{
      x: 100,
      y: 388,
      size: 10,
      font
    })
    page.drawText(pausche || "-",{
      x: 100,
      y: 430,
      size: 10,
      font
    })
    page.drawText(mono || "-",{
      x: 425,
      y: 389,
      size: 10,
      font
    })
    page.drawText(kissentyp || "-",{
      x: 425,
      y: 440,
      size: 10,
      font
    })
    page.drawText(kissenkeder || "-",{
      x: 425,
      y: 429,
      size: 10,
      font
    })
    page.drawText(kissenlaenge || "-",{
      x: 425,
      y: 418,
      size: 10,
      font
    })
    page.drawText(`Steine: ${steine}` || "-",{
      x: 100,
      y: 300,
      size: 10,
      font
    })
    page.drawText(`Packringe: ${packringe}` || "-",{
      x: 100,
      y: 289,
      size: 10,
      font
    })
    page.drawText(`Zusätzliche Beschreibung: ${kommentar}` || "-",{
      x: 100,
      y: 260,
      size: 10,
      font
    })
    page.drawText(`Zubehör: ${zubehör}` || "-",{
      x: 100,
      y: 220,
      size: 10,
      font
    })
    page.drawText(`Name: ${name}` || "-",{
      x: 350,
      y: 750,
      size: 12,
      font
    })
    page.drawText(`Straße: ${straße}` || "-",{
      x: 350,
      y: 735,
      size: 12,
      font
    })
    page.drawText(`Ort: ${plz}` || "-",{
      x: 350,
      y: 722,
      size: 12,
      font
    })
    page.drawText(`Telefon: ${tel}` || "-",{
      x: 350,
      y: 709,
      size: 12,
      font
    })
    page.drawText(`E-Mail: ${mail}` || "-",{
      x: 350,
      y: 696,
      size: 12,
      font
    })

    page.drawText(`Preis: ${anzahlung} €` || "-",{
      x: 50,
      y: 75,
      size: 10,
      font
    })
    page.drawText(`Anzahlung: ${preis} €` || "-",{
      x: 50,
      y: 64,
      size: 10,
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

      const x = width - sigWidth - 40;
      const y = 40; 

      page.drawImage(pngImage, {
        x,
        y,
        width: sigWidth,
        height: sigHeight,
      });
    }

  // PDF erzeugen
  const pdfBytes = await pdfDoc.save();
  const safeBytes = new Uint8Array(pdfBytes);

  // Alte Preview URL aufräumen
  if (pdfPreviewUrl) {
    URL.revokeObjectURL(pdfPreviewUrl);
  }

  // Neue Blob URL erstellen
  const blob = new Blob([safeBytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);

  // URL speichern
  setPdfPreviewUrl(url);

  // Vorschau in neuem Tab öffnen
  const previewWindow = window.open("", "_blank");
  if(!previewWindow){
    alert("Popup blocked");
    return;
  }
    // HTML mit eingebettetem PDF schreiben
  previewWindow.document.write(`
    <html>
      <head>
        <title>PDF Vorschau</title>
        <style>
          html, body {
            margin: 0;
            padding: 0;
            height: 100%;
            overflow: hidden;
            background: #666;
          }
          embed {
            width: 100%;
            height: 100%;
            border: none;
          }
        </style>
      </head>
      <body>
        <embed src="${url}" type="application/pdf" />
      </body>
    </html>
  `);

  previewWindow.document.close();
}

  function savePreviewPdf() {
      if (!pdfPreviewUrl) return;

      const a = document.createElement("a");
      a.href = pdfPreviewUrl;
      a.download = "Sattelbestellung.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
    }

  return (
    <main style={{ padding: 30, maxWidth: 600 }}>
      <h1
        style={{fontWeight: "bold", fontSize: 20}}>
        Sattelbestellung 
      </h1>
    <br/>
    <h1
      style={{fontWeight: "bold", fontSize: 18}}>
      Kunde
    </h1>
    <input
    type="text"
    placeholder="Name"
    value={name}
    onChange={(e) =>
  SetName(e.target.value)}
    style={{
      width:300,
      padding: 10,
      marginBottom: 20,
    }}
    />
    <input
    type="text"
    placeholder="Straße"
    value={straße}
    onChange={(e) =>
  SetStraße(e.target.value)}
    style={{
      width:300,
      padding: 10,
      marginBottom: 20,
    }}
    />
    <input
    type="text"
    placeholder="PLZ Ort"
    value={plz}
    onChange={(e) =>
  SetPlz(e.target.value)}
    style={{
      width:300,
      padding: 10,
      marginBottom: 20,
    }}
    />
    <input
    type="text"
    placeholder="Telefon"
    value={tel}
    onChange={(e) =>
  SetTel(e.target.value)}
    style={{
      width:300,
      padding: 10,
      marginBottom: 20,
    }}
    />
    <input
    type="text"
    placeholder="email"
    value={mail}
    onChange={(e) =>
  SetMail(e.target.value)}
    style={{
      width:300,
      padding: 10,
      marginBottom: 20,
    }}
    />
    <h1
      style={{fontWeight: "bold", fontSize: 18}}>
      Sattel allgemein 
    </h1>
<>
      {/*Test dynamic*/}
    {/* Modell */}
<select
  value={modell}
  onChange={(e) => {
    const m = e.target.value;
    setModell(m);
    setPausche(""); // RESET wenn sich Eingabe ändert
  }}
  style={{ width: "100%", padding: 10, marginBottom: 12 }}
>
  <option value="">Modell auswählen</option>
  <option value="Bentley St. Michael">Bentley St. Michael</option>
  <option value="Bentley St. Florian">Bentley St. Florian</option>
  <option value="Bentley Performence">Bentley Performence</option>
  <option value="Endurance">Endurance</option>
  <option value="Icelandic">Icelandic</option>
  <option value="FSA Dressur">FSA Dressur</option>
  <option value="FSA Springer">FSA Springer</option>
  <option value="FSA Vielseitigkeit">FSA Vielseitigkeit</option>
  <option value="FSA Icelandic">FSA Icelandic</option>
  <option value="Cayenne Classic">Cayenne Classic</option>
  <option value="Cayenne Offroad">Cayenne Offroad</option>
</select>
  <Dropdown
    value={sattelbaum}
    onChange={setSattelbaum}
    placeholder="Sattelbaum"
    options={["KS-Baum", "AEX-Baum"]}
  />
  <Dropdown
    value={sattelfarbe}
    onChange={setSattelfarbe}
    placeholder="Sattelfarbe"
    options={["Sattelfarbe: Schwarz", "Sattelfarbe: Braun", "Sattelfarbe: Cognac"]} 
  />
  <Dropdown
    value={nahtfarbe}
    onChange={setNahtfarbe}
    placeholder="Nahtfarbe"
    options={["Nähte: Rot", "Nähte: Cognac", "Nähte: Gelb", "Nähte: Braun", "Nähte: Beige", "Nähte: Grau", "Nähte: Weiss", "Nähte: Schwarz", "Nähte: Kirsche", "Nähte: Hellblau", "Nähte: Grün", "Nähte: Türkis", "Nähte: Kupfer", "Nähte: Lila", "Nähte: Blau", "Nähte: Orange"
    ]}
  />
  <h1
    style={{fontWeight: "bold", fontSize: 18}}>
    Sitz
  </h1>
  <Dropdown
    value={groesse}
    onChange={setGroesse}
    placeholder="Sitzgröße"
    options={["Sitzgröße: 16", "Sitzgröße: 16,5", "Sitzgröße: 17", "Sitzgröße: 17,5", "Sitzgröße: 18"]}
  />
  <Dropdown
    value={keder}
    onChange={setKeder}
    placeholder="Kederfarbe"
    options={["Keder: Rot", "Keder: Cognac", "Keder: Gelb", "Keder: Dunkelbraun", "Keder: Hellbraun", "Keder: Beige", "Keder: Grau", "Keder: Weiss", "Keder: Schwarz", "Keder: Lack Schwarz", "Keder: Türkis", "Keder: Blau", "Keder: Orange", "Keder: Silber", "Keder: Gold"]}
  />  
  <Dropdown
    value={efter}
    onChange={setEfter}
    placeholder="Efterhöhe"
    options={["Efter Standard", "Efter +1cm", "Efter +2cm", "Efter +3cm", "Efter -1cm", "Efter -2cm"]} 
  />
  <Dropdown
    value={spiegelart}
    onChange={setSpiegelart}
    placeholder="Spiegel"
    options={["Spiegel Lack", "Spiegel Leder"]}
  />
  <Dropdown
    value={spiegelfarbe}
    onChange={setSpiegelfarbe}
    placeholder="Spiegelfarbe"
    options={["schwarz", "dunkelbraun","teak", "cognac", "rot", "beige", "grau", "weiss", "kirsche", "hellblau", "grün", "dunkelrot", "blau", "orange", "kroko schwarz", "kroko blau", "kroko dunkelrot", "kroko braun", "rochen", "schwarz - weiss", "gold", "gecko", "glitzer schwarz", "glitzer braun", "glitzer beige", "glitzer silber"]}
  />
  <Dropdown
    value={zubusseart}
    onChange={setZubusseart}
    placeholder="Zubusse"
    options={["Zubusse Lack", "Zubusse Leder"]}
  />
  <Dropdown
    value={zubussefarbe}
    onChange={setZubussfarbe}
    placeholder="Zubusse Farbe"
    options={["schwarz", "dunkelbraun","teak", "cognac", "rot", "beige", "grau", "weiss", "kirsche", "hellblau", "grün", "dunkelrot", "blau", "orange"]}
  />
  <h1
    style={{fontWeight: "bold", fontSize: 18}}>
    Sattelblatt
  </h1>
  <Dropdown
    value={vorschnitt}
    onChange={setVorschnitt}
    placeholder="Vorschnitt"
    options={["Vorschnitt Standard", "Vorschnitt -1cm", "Vorschnitt +1cm","Vorschnitt +2cm", "Vorschnitt +3cm"]}
  />
  <Dropdown
    value={sattelblatt}
    onChange={setSattelblatt}
    placeholder="Sattelblatt"
    options={["Sattelblatt doubliert", "Sattelblatt pig skin", "Sattelblatt glatt"]}
  />
  <Dropdown
    value={mono}
    onChange={setMono}
    placeholder="Mono-Doppel"
    options={["Standard", "Doppelblatt", "Monoblatt"]}
  />
  <h1
    style={{fontWeight: "bold", fontSize: 18}}>
    Pausche
  </h1>
  <Dropdown
    value={pauschentasche}
    onChange={setPauschentasche}
    placeholder="Pauschentasche"
    options={["PT: Ja", "PT: Nein"]}
  />
  <select
  value={pausche}
  onChange={(e) => setPausche(e.target.value)}
  disabled={!modell}
  style={{ width: "100%", padding: 10, marginBottom: 12 }}
>
  <option value="">
    {modell ? "Pausche auswählen" : "Bitte zuerst Modell wählen"}
  </option>

  {pauscheOptions.map((p) => (
    <option key={p} value={p}>
      {p}
    </option>
  ))}
</select>
{pausche === "Pausche hochgesetzt" && (
  <div style={{ marginTop: 20, marginBottom: 20 }}>
    <Image
      src="/pauschehoch.jpeg"
      alt="Spezialpausche 1"
      width={300}
      height={200}
    />
  </div>
)}

  <h1
    style={{fontWeight: "bold", fontSize: 18}}>
    Kissen
  </h1>
  <Dropdown
    value={kissentyp}
    onChange={setKissentyp}
    placeholder="Kissen"
    options={["Kissen: Stabelizer", "Kissen: Frz. Kissen", "Kissen: Engl. Kissen"]}
  />
  <Dropdown
    value={kissenkeder}
    onChange={setKissenkeder}
    placeholder="Kissenkeder"
    options={["Kissenkeder: Rot", "Kissenkeder: Cognac", "Kissenkeder: Gelb", "Kissenkeder: Dunkelbraun", "Kissenkeder: Hellbraun", "Kissenkeder: Beige", "Kissenkeder: Grau", "Kissenkeder: Weiss", "Kissenkeder: Schwarz", "Kissenkeder: Lack Schwarz", "Kissenkeder: Türkis", "Kissenkeder: Blau", "Kissenkeder: Orange", "Kissenkeder: Silber", "Kissenkeder: Gold"]}
  />
  <Dropdown
    value={kissenlaenge}
    onChange={setKissenlaenge}
    placeholder="Kissenlänge"
    options={["Kissenlänge Standard", "Kissenlänge kurz", "Kissenlänge lang"]}
  />
  <input
    type="text"
    placeholder="Steine Beschreibung falls gewünscht"
    value={steine}
    onChange={(e) =>
  SetSteine(e.target.value)}
    style={{
      width:350,
      padding: 10,
      marginBottom: 20,
    }}
    />
    <input
    type="text"
    placeholder="Packringe nur bei Abweichung ausfüllen"
    value={packringe}
    onChange={(e) =>
  SetPackringe(e.target.value)}
    style={{
      width:350,
      padding: 10,
      marginBottom: 20,
    }}
    />
    <h1
    style={{fontWeight: "bold", fontSize: 18}}>
    Sonstiges
  </h1>
  <textarea
    placeholder="Zusätzliche Beschreibung"
    value={kommentar}
    onChange={(e) =>
  setKommentar(e.target.value)}
    rows={5}
    style={{
      width:500,
      height: 120,
      padding: 10,
      marginBottom: 20,
      resize: "none",
    }}
  />
  <br/>
  <textarea
    placeholder="Zubehör"
    value={zubehör}
    onChange={(e) =>
  SetZubehör(e.target.value)}
    rows={5}
    style={{
      width:500,
      height: 120,
      padding: 10,
      marginBottom: 20,
      resize: "none",
    }}
  />
  <input
    type="text"
    placeholder="Preis (nur Zahl eingeben)"
    value={preis}
    onChange={(e) =>
  SetPreis(e.target.value)}
    style={{
      width:300,
      padding: 10,
      marginBottom: 20,
    }}
    />
    <input
    type="text"
    placeholder="Anzahlung (nur Zahl eingeben)"
    value={anzahlung}
    onChange={(e) =>
  SetAnzahlung(e.target.value)}
    style={{
      width:300,
      padding: 10,
      marginBottom: 20,
    }}
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

      <button
  type="button"
  onClick={generatePDF}
  style={{
    padding: "12px 18px",
    fontSize: 16,
    marginRight: 12,
  }}
>
  PDF Vorschau öffnen
</button>

<button
  type="button"
  onClick={savePreviewPdf}
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

