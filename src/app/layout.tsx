import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Switching to Inter for industrial look
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AutoFix - Workshop Management System",
  description: "Advanced Workshop Management System for 2-wheeler and 4-wheeler repair shops.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} antialiased min-h-screen bg-background text-foreground`}>
        <Providers>
          <div id="app-root" className="flex min-h-screen w-full">
            <Sidebar />
            <div className="flex flex-col flex-1 w-full">
              <Header />
              <main className="flex-1 p-4 md:p-6 overflow-auto bg-background/50">
                {children}
              </main>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
