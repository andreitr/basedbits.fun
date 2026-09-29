import { Web3Provider } from "@/app/lib/Web3Provider";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata, Viewport } from "next";
import { Toaster } from "react-hot-toast";
import "./global.css";

export const metadata: Metadata = {
  title: "Based Bits",
  description:
    "8000 Based Bits causing byte-sized mischief on the BASE chain, a nerdy collection by andreitr.eth and gretagremplin.eth",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#DDF5DD",
};

// No request data (cookies/headers) is read here so pages can be statically rendered and served from the CDN;
// the wallet connection is restored on the client instead
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-mono">
        <Toaster />
        <SpeedInsights />
        <Web3Provider>{children}</Web3Provider>
      </body>
    </html>
  );
}
