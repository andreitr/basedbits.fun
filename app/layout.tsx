import type {Metadata} from "next";
import "./globals.css";
import {config} from '@/config'
import Web3ModalProvider from '@/context'
import {headers} from 'next/headers'


import {cookieToInitialState} from 'wagmi'

export const metadata: Metadata = {
    title: "Based Bits",
    description: "8000 Based Bits causing byte-sized mischief on the BASE chain, a nerdy collection by andreitr.eth and gretegremplin.eth",
};


export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {

    const initialState = cookieToInitialState(config, headers().get('cookie'))
    return (
        <html lang="en">
        <body className="font-mono">
        <Web3ModalProvider initialState={initialState}>
            {children}
        </Web3ModalProvider>
        </body>
        </html>
    );
}
