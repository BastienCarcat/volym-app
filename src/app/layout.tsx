import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Volym",
  description:
    "Application de musculation pour créer des programmes d'entraînement",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased`}>{children}</body>
    </html>
  );
}
