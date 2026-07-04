import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "desenvolvem — Chatbot de Ideias",
  description: "Organize, estruture e valide suas ideias de negócios com ajuda do consultor inteligente desenvolvem.",
  openGraph: {
    title: "desenvolvem — Chatbot de Ideias",
    description: "Organize, estruture e valide suas ideias de negócios com ajuda do consultor inteligente desenvolvem.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "desenvolvem — Chatbot de Ideias",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "desenvolvem — Chatbot de Ideias",
    description: "Organize, estruture e valide suas ideias de negócios com ajuda do consultor inteligente desenvolvem.",
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
      <body className="min-h-full flex flex-col bg-slate-50 dark:bg-zinc-950 transition-colors duration-300">
        {children}
      </body>
    </html>
  );
}
