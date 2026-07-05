import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://desenvolvem.com.br'),
  title: "Desenvolvem — Chatbot de Ideias",
  description: "Organize, estruture e valide suas ideias de negócios com ajuda do consultor inteligente Desenvolvem.",
  openGraph: {
    title: "Desenvolvem — Chatbot de Ideias",
    description: "Organize, estruture e valide suas ideias de negócios com ajuda do consultor inteligente Desenvolvem.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Desenvolvem — Chatbot de Ideias",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Desenvolvem — Chatbot de Ideias",
    description: "Organize, estruture e valide suas ideias de negócios com ajuda do consultor inteligente Desenvolvem.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 dark:bg-zinc-950 transition-colors duration-300 w-full max-w-full overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
