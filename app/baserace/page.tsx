"use server";

import { Header } from "@/app/lib/components/client/Header";
import { Footer } from "@/app/lib/components/Footer";
import { MintComponent } from "@/app/baserace/components/MintComponent";
import {
  fetchRaceCount,
  getRaceCount,
} from "@/app/lib/api/baserace/getRaceCount";
import { ClientWrapper } from "@/app/lib/components/ClientWrapper";
import { getMintFee } from "@/app/lib/api/baserace/getMintFree";
import { fetchRace } from "@/app/lib/api/baserace/getRace";
import { fetchLap } from "@/app/lib/api/baserace/getLap";
import { CountDownToDate } from "@/app/lib/components/client/CountDownToDate";
import { UserList } from "@/app/lib/components/client/UserList";
import { Racers } from "@/app/baserace/components/Racers";
import { fetchMintTime, getMintTime } from "@/app/lib/api/baserace/getMintTime";

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
  const currentRace = await fetchRaceCount();

  // Hard code
  const price = await getMintFee();
  const race = await fetchRace(currentRace);
  const lap = await fetchLap(currentRace, race.currentLap);

  //  Cached for one week
  const mintTime = await getMintTime();

  return (
    <div className="flex flex-col justify-center items-center w-full">
      {mintTime}
      <div className="flex justify-center items-center w-full bg-[#DDF5DD] px-10 lg:px-0 pb-8 sm:pb-0">
        <div className="container max-w-screen-lg">
          <Header />
          <MintComponent id={currentRace} mintTime={mintTime} price={price} />

          <div className="grid grid-cols-4 my-8 gap-8 ">
            <div className="col-span-3">
              <Racers count={100} eliminated={25} />
            </div>

            <div className="">
              <Racers count={7} eliminated={3} />
              Boost
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
