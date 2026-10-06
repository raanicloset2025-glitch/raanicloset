import type { Metadata, Viewport } from "next";
import { Playfair_Display, Montserrat, Great_Vibes, Cinzel } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });
const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-montserrat", weight: ["300", "400", "500"] });
const greatVibes = Great_Vibes({ weight: "400", subsets: ["latin"], variable: "--font-painter" });
const cinzel = Cinzel({ subsets: ["latin"], variable: "--font-royal" });

import SmoothScrolling from "@/components/SmoothScrolling";
import CartDrawer from '@/components/CartDrawer';
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import AuthModal from "@/components/AuthModal";
import DynamicFavicon from "@/components/DynamicFavicon";

import { Providers } from "./Providers";

export const viewport: Viewport = {
  themeColor: "#1A0B16",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

const DEFAULT_METADATA: Metadata = {
  metadataBase: new URL("https://raani.pages.dev"),
  title: {
    default: "Raani Closet | Bespoke Vintage Elegance & High Jewels",
    template: "%s | Raani Closet Boutique",
  },
  description: "Raani Closet is an ultra-luxury bespoke boutique offering handcrafted vintage suits, haute couture, and exquisite high jewelry.",
  keywords: ["Raani Closet", "Bespoke Vintage Elegance", "Luxury Boutique", "High Jewels", "Custom Suits", "Indian Haute Couture", "Raani Closet Boutique"],
  authors: [{ name: "Raani Closet" }],
  creator: "Raani Closet",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://raani.pages.dev",
    siteName: "Raani Closet",
    title: "Raani Closet | Bespoke Vintage Elegance & High Jewels",
    description: "Discover handcrafted vintage suits, haute couture, and exquisite high jewelry at Raani Closet.",
    images: [
      {
        url: "/raani-logo-new.png",
        width: 1200,
        height: 630,
        alt: "Raani Closet Luxury Boutique",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Raani Closet | Bespoke Vintage Elegance",
    description: "Discover handcrafted vintage suits, haute couture, and exquisite high jewelry at Raani Closet.",
    images: ["/raani-logo-new.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

interface SettingsPayload {
  brandName?: string;
  clothingCategoryHeading?: string;
  clothingSubtext?: string;
  clothingLogo?: string;
  jewelryLogo?: string;
  domain?: string;
  seoTitle?: string;
  seoDescription?: string;
  [key: string]: unknown;
}

const SETTINGS_ENDPOINT = process.env.SETTINGS_API_URL || "http://localhost:8787/api/settings";

function safeUrl(rawUrl?: string, fallback = "https://raani.pages.dev"): URL {
  if (!rawUrl) return new URL(fallback);
  try {
    const formatted = rawUrl.startsWith("http://") || rawUrl.startsWith("https://")
      ? rawUrl
      : `https://${rawUrl}`;
    return new URL(formatted);
  } catch {
    return new URL(fallback);
  }
}

async function fetchDynamicSettings(): Promise<SettingsPayload | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1500);

    const res = await fetch(SETTINGS_ENDPOINT, {
      signal: controller.signal,
      next: { revalidate: 60 },
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    if (!data || typeof data !== "object") {
      return null;
    }

    if (typeof (data as Record<string, unknown>).value === "string") {
      try {
        return JSON.parse((data as Record<string, unknown>).value as string);
      } catch {
        return null;
      }
    }

    const unwrapped = (data as Record<string, unknown>).data;
    if (unwrapped && typeof unwrapped === "object") {
      return unwrapped as SettingsPayload;
    }

    return data as SettingsPayload;
  } catch {
    return null;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  try {
    const settings = await fetchDynamicSettings();
    if (!settings || Object.keys(settings).length === 0) {
      return DEFAULT_METADATA;
    }

    const brandName = typeof settings.brandName === "string" && settings.brandName.trim()
      ? settings.brandName.trim()
      : "Raani Closet";

    const defaultTitle = typeof settings.seoTitle === "string" && settings.seoTitle.trim()
      ? settings.seoTitle.trim()
      : typeof settings.clothingCategoryHeading === "string" && settings.clothingCategoryHeading.trim()
      ? `${brandName} | ${settings.clothingCategoryHeading.trim()}`
      : "Raani Closet | Bespoke Vintage Elegance & High Jewels";

    const templateTitle = `%s | ${brandName} Boutique`;

    const description = typeof settings.seoDescription === "string" && settings.seoDescription.trim()
      ? settings.seoDescription.trim()
      : typeof settings.clothingSubtext === "string" && settings.clothingSubtext.trim()
      ? `${brandName} - ${settings.clothingSubtext.trim()}`
      : (DEFAULT_METADATA.description as string);

    const logoUrl = (typeof settings.clothingLogo === "string" && settings.clothingLogo.trim())
      || (typeof settings.jewelryLogo === "string" && settings.jewelryLogo.trim())
      || "/raani-logo-new.png";

    const resolvedSiteUrl = safeUrl(typeof settings.domain === "string" ? settings.domain.trim() : undefined);

    return {
      metadataBase: resolvedSiteUrl,
      title: {
        default: defaultTitle,
        template: templateTitle,
      },
      description,
      keywords: DEFAULT_METADATA.keywords,
      authors: [{ name: brandName }],
      creator: brandName,
      openGraph: {
        type: "website",
        locale: "en_US",
        url: resolvedSiteUrl.toString(),
        siteName: brandName,
        title: defaultTitle,
        description,
        images: [
          {
            url: logoUrl,
            width: 1200,
            height: 630,
            alt: `${brandName} Luxury Boutique`,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: defaultTitle,
        description,
        images: [logoUrl],
      },
      robots: DEFAULT_METADATA.robots,
    };
  } catch {
    return DEFAULT_METADATA;
  }
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Store",
  "name": "Raani Closet",
  "image": "https://raani.pages.dev/raani-logo-new.png",
  "description": "Raani Closet is an ultra-luxury bespoke boutique offering handcrafted vintage suits, haute couture, and exquisite high jewelry.",
  "url": "https://raani.pages.dev",
  "telephone": "+919876543210",
  "priceRange": "$$$$",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Luxury District",
    "addressLocality": "Mumbai",
    "addressRegion": "MH",
    "postalCode": "400001",
    "addressCountry": "IN"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${playfair.variable} ${montserrat.variable} ${greatVibes.variable} ${cinzel.variable} font-sans antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Providers>
          <DynamicFavicon />
          <SmoothScrolling>
            {children}
            <CartDrawer />
            <AuthModal />
            <FloatingWhatsApp />
          </SmoothScrolling>
        </Providers>
      </body>
    </html>
  );
}


