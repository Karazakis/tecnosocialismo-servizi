import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://servizi.tecnosocialismo.com"),
  title: "Servizi — Tecnosocialismo",
  description: "Servizi tecnici, di cura e didattici: online, a domicilio e nei luoghi della rete.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Servizi — La capacità giusta, quando serve",
    description: "Trova, richiedi e offri competenze nella rete Tecnosocialismo.",
    url: "https://servizi.tecnosocialismo.com", siteName: "Tecnosocialismo Servizi", locale: "it_IT", type: "website",
    images: [{ url: "/og.png", width: 1536, height: 1024, alt: "Servizi — La capacità giusta, quando serve." }],
  },
  twitter: { card: "summary_large_image", title: "Servizi — Tecnosocialismo", description: "Tecnica, cura e didattica in una rete di persone e luoghi.", images: ["/og.png"] },
};

export const viewport: Viewport = { colorScheme: "dark", themeColor: "#07100f" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="it"><body>{children}</body></html>; }
