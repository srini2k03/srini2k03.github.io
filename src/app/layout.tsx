import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "@fontsource/instrument-serif/400.css";
import "@fontsource/instrument-serif/400-italic.css";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { ScrollProgress } from "@/components/scroll-progress";
import { CursorGlow } from "@/components/cursor-glow";
import { CommandPalette } from "@/components/command-palette";
import { profile } from "@/content/profile";
import { siteUrl } from "@/lib/site";

const description =
  "Srinivasan Balasubramanian, ML engineer in Bangalore. Case studies in hybrid RAG with a calibrated refusal gate, credit-risk MLOps with cost-optimal decisions, LoRA fine-tuning, and statistics on 99K e-commerce orders.";

export const metadata: Metadata = {
  metadataBase: new URL(`${siteUrl}/`),
  title: {
    default: `${profile.name}, ML Engineer`,
    template: `%s · ${profile.name}`,
  },
  description,
  keywords: [
    "Machine Learning Engineer",
    "AI Engineer",
    "Data Scientist",
    "RAG",
    "MLOps",
    "LLM fine-tuning",
    "Bangalore",
    profile.name,
  ],
  authors: [{ name: profile.name, url: profile.github }],
  creator: profile.name,
  openGraph: {
    type: "website",
    url: "./",
    title: `${profile.name}, ML Engineer`,
    description,
    siteName: profile.name,
    images: [{ url: "og.png", width: 1200, height: 630, alt: `${profile.name}, ML Engineer` }],
  },
  twitter: { card: "summary_large_image", title: `${profile.name}, ML Engineer`, description, images: ["og.png"] },
  alternates: { canonical: "./" },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#07090c" },
    { media: "(prefers-color-scheme: light)", color: "#f6f6f2" },
  ],
  width: "device-width",
  initialScale: 1,
};

/** Runs before first paint so the stored theme never flashes. Dark is the default. */
const themeScript = `(function(){try{var t=localStorage.getItem('theme');document.documentElement.dataset.theme=(t==='light'||t==='dark')?t:'dark';}catch(e){document.documentElement.dataset.theme='dark';}})();`;

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: profile.name,
  jobTitle: "Machine Learning Engineer",
  email: `mailto:${profile.email}`,
  url: `${siteUrl}/`,
  sameAs: [profile.github],
  address: { "@type": "PostalAddress", addressLocality: "Bangalore", addressCountry: "IN" },
  alumniOf: { "@type": "CollegeOrUniversity", name: profile.education.school },
  knowsAbout: ["Machine Learning", "Retrieval-Augmented Generation", "MLOps", "LLM fine-tuning", "Statistics", "SQL"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body className="grain min-h-dvh antialiased">
        <Providers>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:text-accent-ink"
          >
            Skip to content
          </a>
          <ScrollProgress />
          <CursorGlow />
          <Nav />
          <CommandPalette />
          <main id="main">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
