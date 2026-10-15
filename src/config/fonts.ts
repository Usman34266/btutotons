import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";

// Plex Sans is variable (wght 100–700), so the 650 H1 weight renders exactly.
export const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  variable: "--font-plex-sans",
  display: "swap",
});

// Plex Mono has static weights only.
export const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
  display: "swap",
});
