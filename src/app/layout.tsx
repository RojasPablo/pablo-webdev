// src/app/layout.tsx
import { ViewTransitions } from "next-view-transitions";
import Nav from "@/components/ui/Nav";
import ScrollFix from "@/components/ui/ScrollFix";
import GridOverlay from "@/components/ui/GridOverlay";
import SmoothScroll from "@/components/ui/SmoothScroll";
import "./globals.css";

import localFont from "next/font/local";
import type { ReactNode } from "react";

const inter = localFont({
  src: [
    {
      path: "../../public/fonts/inter/Inter-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/inter/Inter-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/inter/Inter-SemiBold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../public/fonts/inter/Inter-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-heading",
});

export const metadata = {
  title: {
    default: "Pablo Rojas — Web Developer & UI Engineer",
    template: "%s | Pablo Rojas",
  },
  description:
    "Freelance full-stack web developer specializing in modern, high-performance websites for small businesses and agencies.",
  keywords: [
    "web developer",
    "full stack developer",
    "Next.js developer",
    "Seattle web design",
    "freelance developer",
    "React developer",
  ],
  openGraph: {
    title: "Pablo Rojas — Freelance Web Developer",
    description:
      "Building modern, responsive, high-performance websites for small businesses and agencies.",
    url: "https://placeholder-url.com",
    siteName: "Pablo Rojas Portfolio",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Pablo Rojas — Freelance Web Developer",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <ViewTransitions>
      <html lang="en" className={`${inter.variable}`}>
        <body>
          <SmoothScroll />
          <ScrollFix />
          <GridOverlay />
          {/* NoiseGrainOverlay temporarily disabled for performance testing */}
          {/* <NoiseGrainOverlay
            className="fixed inset-0 z-[999] mix-blend-overlay opacity-65 pointer-events-none"
            patternWidth={100}
            patternHeight={100}
            grainOpacity={0.09}
            grainSpeed={8}
          /> */}
<Nav />
          <main style={{ minHeight: '100vh' }}>
            {children}
          </main>
        </body>
      </html>
    </ViewTransitions>
  );
}
