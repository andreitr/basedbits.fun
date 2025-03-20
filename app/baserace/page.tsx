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
import { getLapTime } from "../lib/api/baserace/getLapTime";
import { RaceFinished } from "./components/RaceFinished";

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
  const lapTime = await getLapTime();
  const mintTime = await getMintTime();

  return (
    <div className="flex flex-col justify-center items-center w-full">
      <div className="flex justify-center items-center w-full bg-[#DDF5DD] px-10 lg:px-0 pb-8 sm:pb-0">
        <div className="container max-w-screen-lg">
          <Header />

          {race.isMinting && (
            <RacePending race={race} mintTime={mintTime} mintPrice={price} />
          )}

          {race.isLive && <RaceLive race={race} lapTime={lapTime} />}

          {race.isFinished && <RaceFinished race={race} />}
        </div>
      </div>

      <div className="flex justify-center items-center w-full px-10 lg:px-0 mt-16 mb-24">
        <Footer />
      </div>
    </div>
  );
}
