
import Image from "next/image";
import Link from "next/link";

export default function Page() {
  return (
    <main style={{ padding: 40, textAlign: "center" }}>
      
      {/*Pauschen*/}
      <Image
        src="/pauschfoto.png"
        alt="Pauschen"
        width={500}
        height={240}
        style={{ marginBottom: 30 }}
      />
      <Image
        src="/sattelinfo.png"
        alt="Pauschen"
        width={500}
        height={240}
        style={{ marginBottom: 30 }}
      />
      
      <Image
        src="/kederfarben_v2.jpeg"
        alt="Keder"
        width={500}
        height={240}
        style={{ marginBottom: 30 }}
      />
      <Image
        src="/nahtfarben_v2.jpeg"
        alt="Nähte"
        width={500}
        height={240}
        style={{ marginBottom: 30 }}
      />
      

    </main>
  );
}