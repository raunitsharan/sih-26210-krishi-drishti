import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Krishi Drishti — AI-Powered Precision Agriculture",
  description:
    "Smart India Hackathon 2026 | Problem ID 26210 | AI-powered crop protection, monitoring and decision support system for precision agriculture.",
  keywords: "precision agriculture, IoT, AI, crop protection, smart irrigation, YOLOv8",
  openGraph: {
    title: "Krishi Drishti — AI-Powered Precision Agriculture",
    description: "3D Interactive Simulation — SIH 2026 Problem 26210",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased min-h-screen bg-[#0a0f0d]">{children}</body>
    </html>
  );
}
