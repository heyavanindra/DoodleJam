import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import TopLoader from "@/components/top-loader";
export const metadata: Metadata = {
  title: "DoodleJam",
  description: "Your collaborative Board",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={``}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <TopLoader></TopLoader>

          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
