import type { Metadata } from "next";
import { Playfair_Display, Outfit } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/cart-context";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import SmoothScroll from "@/components/layout/SmoothScroll";
import ScrollReset from "@/components/layout/ScrollReset";
import AuthProvider from "@/components/layout/AuthProvider";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
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
    url: "https://rarecomforts.in",
    siteName: "RareComforts",
    locale: "en_IN",
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
      className={`${playfair.variable} ${outfit.variable} h-full scroll-smooth`}
    >
      <head>
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground antialiased font-sans">
        <AuthProvider>
          <SmoothScroll>
            <ScrollReset />
            <CartProvider>
              <Navbar />
              <CartDrawer />
              <main className="flex-grow flex flex-col">{children}</main>
              <Footer />
            </CartProvider>
          </SmoothScroll>
        </AuthProvider>
      </body>
    </html>
  );
}

