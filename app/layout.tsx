import type { Metadata, Viewport } from "next";
import "./globals.css";
import SmoothScrollProvider from "@/components/ui/SmoothScrollProvider";
import CustomCursor from "@/components/ui/CustomCursor";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "Gopal Lahoti • Luxury Interior Architecture & Spatial Design",
  description:
    "Award-winning bespoke interior design, turnkey architecture, and spatial harmony by Gopal Lahoti. Sculpting luxurious residences, sky penthouses, corporate headquarters, and sacred sanctums.",
  keywords: [
    "Gopal Lahoti",
    "Gopal Lahoti Designs",
    "Luxury Interior Design",
    "Turnkey Interior Architecture",
    "Penthouse Interior Design Mumbai",
    "Interior Designer Pune",
    "Italian Marble Living Room",
    "Bespoke Millwork",
  ],
  authors: [{ name: "Gopal Lahoti" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#080809] text-[#f4f1ea] antialiased selection:bg-[#c5a880] selection:text-[#080809]">
        <CustomCursor />
        {children}
      </body>
    </html>
  );
}
