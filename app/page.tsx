import Image from "next/image";
import Link from "next/link";

export default function Page() {
  return (
    <main style={{ padding: 40, textAlign: "center" }}>
      
      {/* Logo */}
      <Image
        src="/logo.png"
        alt="Firmenlogo"
        width={250}
        height={120}
        style={{ marginBottom: 30 }}
      />
{/*
      <h1>Willkommen</h1>

      <div style={{ marginTop: 30 }}>
        <p>
          <Link href="/sattelbestellung">
            Zur Sattelbestellung
          </Link>
        </p>

        <p>
          <Link href="/fotos">
            Zu Fotos
          </Link>
        </p>
      </div>
*/}
    </main>
  );
}