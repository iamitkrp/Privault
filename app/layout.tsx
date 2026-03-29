import type { Metadata } from "next";

import { GeistPixelSquare } from "geist/font/pixel";
import { AuthProvider } from "@/components/auth/auth-context";
import { ToastProvider } from "@/components/ui/toast";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

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
    <html
      lang="en"
      data-theme="dark"
      className={GeistPixelSquare.variable}
      suppressHydrationWarning
    >
      <body>
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

