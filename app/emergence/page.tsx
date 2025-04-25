"use server";

import { MintComponent } from "@/app/emergence/components/MintComponent";
import { Header } from "@/app/lib/components/client/Header";
import { Footer } from "@/app/lib/components/Footer";
import { getZeitgeist } from "../lib/api/zeitgeist/getZeitgeist";
import { DBZeitgeist } from "../lib/types/types";

export async function generateMetadata() {
  const title = "The Emergence";
  const description = "Run, Boost, Win!";

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
          <MintComponent />

          <div className="flex flex-col items-center justify-center mt-12 gap-6">

            {records.map((record: DBZeitgeist) => (
              <div
                key={record.id}
                className="bg-black p-6 rounded-lg text-[#83E174]"
              >
                <div className="">

                  <div className="flex flex-row justify-between mb-4">
                    <div className="text-2xl font-semibold">
                      {record.headline}
                    </div>
                    <div>
                      {new Date(record.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </div>
                  </div>
                  <p>{record.lede}</p>
                </div>
              </div>
            ))}
          </div>


        </div>
      </div>



      <div className="flex justify-center items-center w-full px-10 lg:px-0 mt-16 mb-24">
        <Footer />
      </div>
    </div>
  );
}
