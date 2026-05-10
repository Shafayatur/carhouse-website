import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Car House Imports Ltd. — Bangladesh's Premier Luxury Car Importer",
  description: "We import the world's most coveted automobiles — directly sourced from Japan, Germany, UK and USA — fully customs-cleared and delivered to your door in Bangladesh.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
