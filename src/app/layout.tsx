import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LOOP — Learn it. Loop it. Make it.",
  description:
    "LOOP is a crochet learning platform with three connected learning modes: embedded video, written patterns, and guided steps.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
