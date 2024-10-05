"use server";

import { Header } from "@/app/lib/components/Header";
import { Footer } from "@/app/lib/components/Footer";
import { getSocialRewardsRoundCount } from "@/app/lib/api/getSocialRewardsRoundCount";
import { getSocialRewardsRound } from "@/app/lib/api/getSocialRewardsRound";
import { SocialRound } from "@/app/earn/components/SocialRound";

export default async function Page() {
  const id = await getSocialRewardsRoundCount();

  const round = await getSocialRewardsRound({ id });

  return (
    <div className="flex flex-col justify-center items-center w-full">
      <div className="flex justify-center items-center w-full bg-[#DDF5DD] px-10 lg:px-0 pb-8 sm:pb-0">
        <div className="container max-w-screen-lg">
          <Header />
          <SocialRound id={id} round={round} />
        </div>
      </div>

      <div className="flex justify-center items-center w-full px-10 lg:px-0 mt-16 mb-24">
        <Footer />
      </div>
    </div>
  );
}
