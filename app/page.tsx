"use server";

import { Header } from "@/app/lib/components/Header";
import { CheckIn } from "@/app/lib/components/CheckIn";
import { Footer } from "@/app/lib/components/Footer";
import { Social } from "@/app/lib/components/Social";
import { getRaffleById } from "@/app/lib/api/getRaffleById";
import { RaffleComponent } from "@/app/raffle/components/RaffleComponent";
import { getCurrentRaffleId } from "@/app/lib/api/getCurrentRaffleId";
import { revalidatePath } from "next/cache";
import Link from "next/link";

export default async function Home() {
  const raffleId = await getCurrentRaffleId();
  const raffle = await getRaffleById(raffleId);

  return (
    <div className="flex flex-col justify-center items-center w-full">
      <div className="flex justify-center items-center w-full bg-[#DDF5DD] px-10 lg:px-0 pb-8 sm:pb-0">
        <div className="container max-w-screen-lg">
          <Header />
          <RaffleComponent
            id={raffleId}
            raffle={raffle}
            revalidate={async () => {
              "use server";
              revalidatePath("/", "layout");
            }}
          />
        </div>
      </div>
      <div className="flex justify-center items-center w-full bg-[#303730] px-10 lg:px-0 pb-8 sm:pb-0">
        <div className="container max-w-screen-lg text-[#FFFF00] text-center">
          <div className="py-2">
            New Emoji Bits collection dropping on August, 15!{" "}
            <Link className="underline" href="/emojibits">
              Get the alpha
            </Link>
          </div>
        </div>
      </div>

      <div className="flex justify-center items-center w-full bg-[#cae2ca] px-10 lg:px-0 pb-8 sm:pb-0">
        <div className="container max-w-screen-lg">
          <CheckIn />
        </div>
      </div>

      <div className="flex justify-center items-center w-full bg-[#859985] px-10 lg:px-0 pb-8 sm:pb-0">
        <div className="container max-w-screen-lg">
          <Social />
        </div>
      </div>

      <div className="flex justify-center items-center w-full px-10 lg:px-0 mt-16 mb-24">
        <Footer />
      </div>
    </div>
  );
}
