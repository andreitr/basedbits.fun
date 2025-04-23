"use server";

import { Header } from "@/app/lib/components/client/Header";
import { Footer } from "@/app/lib/components/Footer";
import { getZeitgeistById } from "@/app/lib/api/zeitgeist/getZeitgeistById";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{
    id: number;
  }>;
}

export default async function Page(props: Props) {
  const params = await props.params;
  const { id } = params;

  const record = await getZeitgeistById(Number(id));

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
              <div className="bg-white p-8 rounded-lg shadow-md">
                <div className="flex justify-between items-start mb-6">
                  <h1 className="text-4xl font-bold text-gray-900">
                    {record.headline}
                  </h1>
                  <span className="text-gray-500">
                    {new Date(record.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>

                <div className="prose max-w-none">
                  <h2 className="text-2xl font-semibold mb-4">Summary</h2>
                  <p className="text-gray-700 mb-8">{record.lede}</p>

                  <div className="flex flex-col sm:flex-row gap-6 mb-8">
                    <div className="flex-1 bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-xl font-semibold mb-2 text-blue-600">Emotion</h3>
                      <p className="text-gray-700">{record.emotion}</p>
                    </div>
                    <div className="flex-1 bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-xl font-semibold mb-2 text-green-600">Signal</h3>
                      <p className="text-gray-700">{record.signal}</p>
                    </div>
                  </div>
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
