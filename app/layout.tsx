import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "@radix-ui/themes/styles.css";
import { Theme } from "@radix-ui/themes";
import { ThemeProvider } from "next-themes";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Multisim",
  description: "What if WebSim could be multiplayer?",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class">
          <Theme
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            {children}
          </Theme>
        </ThemeProvider>
      </body>
    </html>
  );
}
