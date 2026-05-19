import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "./providers";
import CustomCursor from "@/components/CustomCursor";
import ParticleBackground from "@/components/ParticleBackground";

export const metadata: Metadata = {
  title: "BLOG",
  description: "个人博客",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        <ThemeProvider>
          <CustomCursor />
          <ParticleBackground />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
