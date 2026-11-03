import type { Metadata } from "next";
import RegisterSW from "./register-sw";

export const metadata: Metadata = {
  title: "IMPACT MOB Facturare",
  description: "Aplicație internă pentru avans, contract, factură finală și proces-verbal.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "IMPACT MOB Facturare", statusBarStyle: "default" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ro">
      <body style={{margin:0}}>
        <RegisterSW />
        {children}
      </body>
    </html>
  );
}
