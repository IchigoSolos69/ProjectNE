import type { Metadata } from "next";
import { Playfair_Display, Geist } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CartSheet } from "@/components/cart/cart-sheet";
import { BRAND_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: BRAND_NAME,
    template: `%s · ${BRAND_NAME}`,
  },
  description: "Premium bedding, bath linens, and pillow covers.",
  icons: {
    icon: "/images/logo.png",
    shortcut: "/images/logo.png",
    apple: "/images/logo.png",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#8a5f41",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", playfair.variable, "font-sans", geist.variable)}
    >
      <body className="flex min-h-dvh flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <CartSheet />
      </body>
    </html>
  );
}
