"use server";

import { Header } from "@/app/lib/components/client/Header";
import { Footer } from "@/app/lib/components/Footer";
import { MintComponent } from "@/app/baserace/components/MintComponent";
import { getRaceCount } from "@/app/lib/api/baserace/getRaceCount";
import { ClientWrapper } from "@/app/lib/components/ClientWrapper";
import { getMintFee } from "@/app/lib/api/baserace/getMintFree";

export async function generateMetadata() {
  const race = await getRaceCount();
  const title = `BaseRace #${race}`;
  const description = "Run, Boost, Win!";

  return {
    title: title,
    description: description,
  };
}

export default async function Page() {
  const currentRace = await getRaceCount();
  // const nextRace = await getRace(1);
  // Hard code
  const price = await getMintFee();

  return (
    <div className="flex flex-col justify-center items-center w-full">
      <div className="flex justify-center items-center w-full bg-[#DDF5DD] px-10 lg:px-0 pb-8 sm:pb-0">
        <div className="container max-w-screen-lg">
          <Header />
          <ClientWrapper>
            <MintComponent id={currentRace} price={price} />
          </ClientWrapper>
        </div>
      </div>

      <div className="flex justify-center items-center w-full px-10 lg:px-0 mt-16 mb-24">
        <Footer />
      </div>
    </div>
  );
}
