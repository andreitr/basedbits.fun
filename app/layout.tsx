import type {Metadata} from "next";
import {Roboto} from "next/font/google";
import "./globals.css";


const roboto = Roboto({
    weight: ['400', '700'],
    style: ['normal'],
    subsets: ['latin'],
    display: 'swap',
})

export const metadata: Metadata = {
    title: "Based Bits",
    description: "8000 Based Bits causing byte-sized mischief on the BASE chain, a nerdy collection by andreitr.eth and gretegremplin.eth",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
        <body className={roboto.className}>{children}</body>
        </html>
    );
}
