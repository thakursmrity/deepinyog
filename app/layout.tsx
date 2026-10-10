import type { Metadata } from "next";
import { DM_Sans, Marcellus } from "next/font/google";
import "./globals.css";

const display = Marcellus({ subsets: ["latin"], weight: "400", variable: "--font-display" });
const body = DM_Sans({ subsets: ["latin"], weight: ["400", "500", "700"], variable: "--font-body" });

export const metadata: Metadata = {
  title: "Deepinyog | Yoga and meditation",
  description: "Guided yoga and meditation classes with personal attention, practice between classes, and a student space to see your progress.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  );
}
