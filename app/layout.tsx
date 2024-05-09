import type {Metadata} from "next";
import {Web3Provider} from "@/app/lib/Web3Provider";
import {headers} from "next/headers";
import "./global.css";

export const metadata: Metadata = {
    title: "Based Bits",
    description: "8000 Based Bits causing byte-sized mischief on the BASE chain, a nerdy collection by andreitr.eth and gretegremplin.eth",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {

    const cookie = headers().get('cookie');

    return (
        <html lang="en">
        <body className="font-mono">
        <Web3Provider>
            {children}
        </Web3Provider>
        </body>
        </html>
    );
}
