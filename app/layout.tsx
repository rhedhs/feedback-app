import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import { FeedbackSessionProvider } from "@/contexts/FeedbackSessionContext";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "Website Feedback Tool",
  description: "A tool for collecting and managing website feedback",
  metadataBase: new URL("https://feedback-tool.example.com"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <FeedbackSessionProvider>
          {children}
          <Toaster />
        </FeedbackSessionProvider>
      </body>
    </html>
  );
}
