import type { Metadata } from "next";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/cart-context";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Somnia | Premium Organic Bedding & Sleep Sanctuary",
  description:
    "Discover the ultimate sleep experience with Somnia. Sustainably crafted Egyptian cotton sheets, linen sets, and down pillows designed for pure morning comfort.",
  keywords: ["premium bedding", "organic sheets", "egyptian cotton bedding", "linen duvet cover", "down pillows", "luxury sleep"],
  authors: [{ name: "Somnia Bedding" }],
  openGraph: {
    title: "Somnia | Premium Organic Bedding",
    description: "Sustainably crafted bedding designed for restorative sleep and quiet morning luxury.",
    url: "https://somniabedding.com",
    siteName: "Somnia",
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${plusJakarta.variable} h-full scroll-smooth`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground antialiased font-sans">
        <CartProvider>
          <Navbar />
          <CartDrawer />
          <main className="flex-grow flex flex-col">{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}

