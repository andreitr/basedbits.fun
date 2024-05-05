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
        <body className="flex justify-center font-mono">
        <div className="container">
            <Web3Provider cookie={cookie}>
                {children}
            </Web3Provider>

        </div>
        </body>
        </html>
    );
}
