"use server";

import { getLapTime } from "@/app/lib/api/baserace/getLapTime";
import { getMintFee } from "@/app/lib/api/baserace/getMintFree";
import { getMintTime } from "@/app/lib/api/baserace/getMintTime";
import { fetchRace, getRace } from "@/app/lib/api/baserace/getRace";
import { Header } from "@/app/lib/components/client/Header";
import { Footer } from "@/app/lib/components/Footer";
import { RaceFinished } from "../components/RaceFinished";
import { RaceLive } from "../components/RaceLive";
import { RacePending } from "../components/RacePending";

interface Props {
  params: Promise<{
    id: number;
  }>;
}

export async function generateMetadata(props: Props) {
  const params = await props.params;
  const { id } = params;
  const race = await getRace(Number(id));

  const title = `BaseRace ${id}`;
  const description = `Winner ${race.winner} won ${race.prize}`;

  return {
    title: title,
    description: description,
  };
}

export default async function Page(props: Props) {
  const params = await props.params;
  const { id } = params;

  const price = await getMintFee();
  const race = await fetchRace(Number(id));

  const lapTime = await getLapTime();
  const mintTime = await getMintTime();

  return (
    <div className="flex flex-col justify-center items-center w-full">
      <div className="flex justify-center items-center w-full bg-[#DDF5DD] px-10 lg:px-0 pb-8 sm:pb-0">
        <div className="container max-w-screen-lg">
          <Header />

          {race.isFinished && <RaceFinished race={race} />}

          {race.isMinting && (
            <RacePending race={race} mintTime={mintTime} mintPrice={price} />
          )}

          {race.isLive && <RaceLive race={race} />}
        </div>
      </div>

      <div className="flex justify-center items-center w-full px-10 lg:px-0 mt-16 mb-24">
        <Footer />
      </div>
    </div>
  );
}
