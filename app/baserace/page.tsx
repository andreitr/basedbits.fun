"use server";

import { Header } from "@/app/lib/components/client/Header";
import { Footer } from "@/app/lib/components/Footer";
import { RacePending } from "@/app/baserace/components/RacePending";
import {
  fetchRaceCount,
  getRaceCount,
} from "@/app/lib/api/baserace/getRaceCount";
import { getMintFee } from "@/app/lib/api/baserace/getMintFree";
import { fetchRace } from "@/app/lib/api/baserace/getRace";
import { fetchLap } from "@/app/lib/api/baserace/getLap";
import { Racers } from "@/app/baserace/components/Racers";
import { getMintTime } from "@/app/lib/api/baserace/getMintTime";
import { DateTime } from "luxon";
import { RaceLive } from "@/app/baserace/components/RaceLive";

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

  const mintTime = await getMintTime();
  const isPendingRace =
    race.startedAt > 0 && race.endedAt === 0 && race.currentLap === 0;
  const isLiveRace =
    race.startedAt > 0 && race.endedAt === 0 && race.currentLap > 0;

  return (
    <div className="flex flex-col justify-center items-center w-full">
      <div className="flex justify-center items-center w-full bg-[#DDF5DD] px-10 lg:px-0 pb-8 sm:pb-0">
        <div className="container max-w-screen-lg">
          <Header />

          {isPendingRace && (
            <RacePending race={race} mintTime={mintTime} price={price} />
          )}

          {isLiveRace && <RaceLive race={race} />}

          <div className="grid grid-cols-4 my-8 gap-8 ">
            <div className="col-span-3">
              <Racers count={100} eliminated={25} />
            </div>

            <div>
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
