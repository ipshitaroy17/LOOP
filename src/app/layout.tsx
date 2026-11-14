import type { Metadata } from "next";
import { fraunces, nunito } from "@/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "loop — Learn it. Loop it. Make it.",
  description:
    "loop is a crochet learning platform with three connected learning modes: embedded video, written patterns, and guided steps.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`h-full ${fraunces.variable} ${nunito.variable}`}>
      <body className="min-h-full flex flex-col font-body">{children}</body>
    </html>
  );
}
