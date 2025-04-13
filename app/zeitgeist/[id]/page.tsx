"use server";

import { Header } from "@/app/lib/components/client/Header";
import { Footer } from "@/app/lib/components/Footer";
import { getZeitgeistById } from "@/app/lib/api/zeitgeist/getZeitgeistById";
import { notFound } from "next/navigation";

type Props = {
    params: { id: string };
    searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata({ params }: Props) {
    const record = await getZeitgeistById(Number(params.id));

    if (!record) {
        return {
            title: "Zeitgeist Not Found",
            description: "The requested zeitgeist record could not be found",
        };
    }

    return {
        title: `Zeitgeist: ${record.word}`,
        description: record.summary,
    };
}

export default async function Page({ params }: Props) {
    const record = await getZeitgeistById(Number(params.id));

    if (!record) {
        notFound();
    }

    return (
        <div className="flex flex-col justify-center items-center w-full">
            <div className="flex justify-center items-center w-full bg-[#DDF5DD] px-10 lg:px-0 pb-8 sm:pb-0">
                <div className="container max-w-screen-lg">
                    <Header />

                    <div className="flex flex-col items-center justify-center mt-8">
                        <div className="w-full max-w-2xl">
                            <div className="bg-black p-8 rounded-lg border border-[#00ff00] shadow-[0_0_10px_rgba(0,255,0,0.3)]">
                                <div className="flex justify-between items-start mb-6">
                                    <h1 className="text-4xl font-mono font-bold text-[#00ff00]">{record.word}</h1>
                                    <span className="font-mono text-[#00ff00] text-opacity-70">
                                        {new Date(record.created_at).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </span>
                                </div>

                                <div className="prose max-w-none">
                                    <h2 className="text-2xl font-mono font-semibold mb-4 text-[#00ff00]">Summary</h2>
                                    <p className="font-mono text-[#00ff00] text-opacity-90 mb-8">{record.summary}</p>

                                    {record.context && (
                                        <>
                                            <h2 className="text-2xl font-mono font-semibold mb-4 text-[#00ff00]">Context</h2>
                                            <p className="font-mono text-[#00ff00] text-opacity-90">{record.context}</p>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-center items-center w-full px-10 lg:px-0 mt-16 mb-24">
                <Footer />
            </div>
        </div>
    );
} 