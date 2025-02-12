"use server";

import { Header } from "@/app/lib/components/client/Header";
import { Footer } from "@/app/lib/components/Footer";
import { MintComponent } from "@/app/race/components/MintComponent";
import { getRaceCount } from "@/app/lib/api/baserace/getRaceCount";

export async function generateMetadata() {
  const race = await getRaceCount();
  const title = `BaseRace - ${race}`;
  const description = "Run, Boost, Win!";

  return {
    title: title,
    description: description,
  };
}

export default async function Page() {
  const race = await getRaceCount();

  return (
    <div className="flex flex-col justify-center items-center w-full">
      <div className="flex justify-center items-center w-full bg-[#DDF5DD] px-10 lg:px-0 pb-8 sm:pb-0">
        <div className="container max-w-screen-lg">
          <Header />
          Our rance is {race}
          <MintComponent />
        </div>
      </div>

      <div className="flex justify-center items-center w-full px-10 lg:px-0 mt-16 mb-24">
        <Footer />
      </div>
    </div>
  );
}
