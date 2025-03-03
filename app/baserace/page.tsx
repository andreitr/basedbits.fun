"use server";

import { RaceLive } from "@/app/baserace/components/RaceLive";
import { RacePending } from "@/app/baserace/components/RacePending";
import { getMintFee } from "@/app/lib/api/baserace/getMintFree";
import { getMintTime } from "@/app/lib/api/baserace/getMintTime";
import { fetchRace } from "@/app/lib/api/baserace/getRace";
import {
  fetchRaceCount,
  getRaceCount,
} from "@/app/lib/api/baserace/getRaceCount";
import { Header } from "@/app/lib/components/client/Header";
import { Footer } from "@/app/lib/components/Footer";

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

  const price = await getMintFee();
  const race = await fetchRace(currentRace);

  const mintTime = await getMintTime();
  const isPendingRace = race.startedAt > 0 && race.endedAt === 0 && race.lapCount === 0;
  const isLiveRace = race.startedAt > 0 && race.endedAt === 0 && race.lapCount > 0;

  return (
    <div className="flex flex-col justify-center items-center w-full">
      <div className="flex justify-center items-center w-full bg-[#DDF5DD] px-10 lg:px-0 pb-8 sm:pb-0">
        <div className="container max-w-screen-lg">
          <Header />
          {isPendingRace && (
            <RacePending race={race} mintTime={mintTime} price={price} />
          )}

          {isLiveRace && <RaceLive race={race} />}
        </div>
      </div>

      <div className="flex justify-center items-center w-full px-10 lg:px-0 mt-16 mb-24">
        <Footer />
      </div>
    </div>
  );
}
