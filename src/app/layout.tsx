import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { LlamaHydrator } from "@/components/llama/LlamaHydrator";
import { IntentionModal } from "@/components/llama/IntentionModal";

export const metadata: Metadata = {
  title: "CAMINO — Tu jornada espiritual",
  description:
    "CAMINO: una PWA católica para caminar cada día con Dios. Jornada guiada, Rosario Comunitario Vivo y tu Jardín del Alma.",
  applicationName: "CAMINO",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "CAMINO",
  },
};

export const viewport: Viewport = {
  themeColor: "#f7f5f0",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-dvh bg-[#f7f5f0] text-[#1c1c1e] antialiased">
        <LlamaHydrator />
        <IntentionModal />
        {children}
      </body>
    </html>
  );
}
