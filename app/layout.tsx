import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Happy December — Best Kids' Apps Challenge | ThinkUp Innovation Services",
  description:
    "Kids pitch their app ideas and compete for prizes in a fun, creative and exciting event! Saturday, December 12, 2026 at ThinkUp Innovation Hub, Ibadan.",
  openGraph: {
    title: "Happy December — Best Kids' Apps Challenge",
    description:
      "Kids pitch their app ideas and compete for prizes (Ages 2–19) on Saturday, December 12, 2026 at ThinkUp Innovation Hub, Ibadan.",
    images: ["/flyer.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Happy December — Best Kids' Apps Challenge",
    description:
      "Kids pitch their app ideas and compete for prizes (Ages 2–19) on Saturday, December 12, 2026 at ThinkUp Innovation Hub, Ibadan.",
    images: ["/flyer.jpg"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-body antialiased">{children}</body>
    </html>
  );
}
