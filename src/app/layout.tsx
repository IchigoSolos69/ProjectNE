import type { Metadata } from "next";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/cart-context";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import SmoothScroll from "@/components/layout/SmoothScroll";

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
  title: "RareComforts | Premium Organic Bedding & Sleep Sanctuary",
  description:
    "Discover the ultimate sleep experience with RareComforts. Sustainably crafted Egyptian cotton sheets, linen sets, and down pillows designed for pure morning comfort.",
  keywords: ["premium bedding", "organic sheets", "egyptian cotton bedding", "linen duvet cover", "down pillows", "luxury sleep"],
  authors: [{ name: "RareComforts Bedding" }],
  openGraph: {
    title: "RareComforts | Premium Organic Bedding",
    description: "Sustainably crafted bedding designed for restorative sleep and quiet morning luxury.",
    url: "https://rarecomforts.com",
    siteName: "RareComforts",
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
        <SmoothScroll>
          <CartProvider>
            <Navbar />
            <CartDrawer />
            <main className="flex-grow flex flex-col">{children}</main>
            <Footer />
          </CartProvider>
        </SmoothScroll>
      </body>
    </html>
  );
}

