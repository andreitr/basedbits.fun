"use server";

import { Header } from "@/app/lib/components/client/Header";
import { Footer } from "@/app/lib/components/Footer";
import { getZeitgeist } from "@/app/lib/api/zeitgeist/getZeitgeist";
import { DBZeitgeist } from "@/app/lib/types/types";
import Link from "next/link";

export async function generateMetadata() {
  const title = "Zeitgeist";
  const description = "Explore the spirit of the times";

  return {
    title: title,
    description: description,
  };
}

export default async function Page() {
  const records = await getZeitgeist();

  return (
    <div className="flex flex-col justify-center items-center w-full">
      <div className="flex justify-center items-center w-full bg-[#DDF5DD] px-10 lg:px-0 pb-8 sm:pb-0">
        <div className="container max-w-screen-lg">
          <Header />

          <div className="flex flex-col items-center justify-center mt-8">
            <h1 className="text-4xl font-bold mb-8">Zeitgeist</h1>

            <div className="w-full space-y-6">
              {records.map((record: DBZeitgeist) => (
                <div
                  key={record.id}
                  className="bg-white p-6 rounded-lg shadow-md"
                >
                  <div className="flex justify-between items-start mb-4">
                    <Link
                      href={`/zeitgeist/${record.id}`}
                      className="text-2xl font-semibold text-blue-600 hover:text-blue-800"
                    >
                      {record.headline}
                    </Link>
                    <span className="text-gray-500">
                      {new Date(record.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <p className="text-gray-700">{record.lede}</p>
                </div>
              ))}
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
