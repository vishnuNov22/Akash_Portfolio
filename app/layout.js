import { Instrument_Serif, Inter_Tight } from "next/font/google";
import "./globals.css";

const serif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});
const sans = Inter_Tight({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata = {
  title: "Akash — Photographer · Live moments, never staged",
  description:
    "Akash — photographer and founder of AdsWeddings. Weddings, portraits, street, travel, nature, events and fashion.",
};

export const viewport = { themeColor: "#10201A" };

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
