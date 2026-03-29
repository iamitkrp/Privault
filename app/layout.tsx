import type { Metadata } from "next";

import {
  Inter,
  JetBrains_Mono,
  Space_Grotesk,
  Syne,
} from "next/font/google";
import { AuthProvider } from "@/components/auth/auth-context";
import { ToastProvider } from "@/components/ui/toast";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Privault — Zero-Knowledge Password Manager",
  description:
    "Secure, private, zero-knowledge password management. Your passwords are encrypted on your device before they ever leave your browser.",
  keywords: [
    "password manager",
    "zero-knowledge",
    "encryption",
    "security",
    "privacy",
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Security headers and nonces are processed directly by Next.js using the x-nonce header
  // provided by middleware.ts, no manual `nonce` attributes needed.

  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${syne.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="data-theme"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <AuthProvider>
            <ErrorBoundary>
              <ToastProvider>
                {children}
              </ToastProvider>
            </ErrorBoundary>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

