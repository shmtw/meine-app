"use client";

import { useState } from "react";

export default function Page() {
  const [auswahl, setAuswahl] = useState("Sattelfarbe");

  function senden() {
    if (auswahl === "Sattelfarbe") {
      alert("Bitte zuerst etwas auswählen.");
      return;
    }
    alert("Du hast gewählt: " + auswahl);
  }

  return (
    <main style={{ padding: 24, maxWidth: 520 }}>
      <h1>Meine Seite</h1>

      {/* <label htmlFor="dropdown">Sattelfarbe</label>*/}
      <select
        id="dropdown"
        value={auswahl}
        onChange={(e) => setAuswahl(e.target.value)}
        style={{ width: "100%", padding: 10, marginTop: 8, marginBottom: 12 }}
      >
        <option value="Sattelfarbe" disabled>
          Sattelfarbe
        </option>
        <option value="schwarz">schwarz</option>
        <option value="braun">braun</option>
        <option value="lila">lila</option>
      </select>

      <button onClick={senden} style={{ padding: "10px 14px" }}>
        Senden
      </button>
    </main>
  );
}