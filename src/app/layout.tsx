import type { Metadata } from "next";
import { Fraunces, Geist_Mono, Manrope } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { ThemeProvider } from "@/contexts/AppContext";
import { SettingsProvider } from "@/contexts/AppContext";
import { AppProvider } from "@/contexts/AppContext";
import { Toaster } from "@/components/ui/sonner";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "StudyForge AI - Turn Your PDFs into Exam-Ready Notes",
  description: "AI-powered study platform for engineering students. Upload PDFs, generate VTU-style answers, summaries, quizzes, and revision plans.",
  keywords: ["study", "AI", "VTU", "engineering", "notes", "exam preparation", "PDF", "quiz", "revision"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${manrope.variable} ${fraunces.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider>
          <SettingsProvider>
            <AppProvider>
              {children}
              <Toaster 
                position="top-right" 
                toastOptions={{
                  className: "glass-strong",
                  style: { background: 'var(--card)', border: '1px solid var(--border)' },
                }}
              />
              {/* WARNING FOR AGENT: DO NOT REMOVE THIS SCRIPT */}
              <Script src="https://cdn.jsdelivr.net/gh/IdeavoAI/ideavo-scripts@latest/scripts/ideavo.min.js" />
            </AppProvider>
          </SettingsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
