"use server";

import { Header } from "@/app/lib/components/client/Header";
import { Footer } from "@/app/lib/components/Footer";
import { getSocialRewardsRoundCount } from "@/app/lib/api/getSocialRewardsRoundCount";
import { getSocialRewardsRound } from "@/app/lib/api/getSocialRewardsRound";
import { SocialRound } from "@/app/earn/components/SocialRound";
import { getSocialRewardsAmount } from "@/app/lib/api/getSocialRewardsAmount";
import { getSocialRewardsRoundDuration } from "@/app/lib/api/getSocialRewardsRoundDuration";

export default async function Page() {
  const id = await getSocialRewardsRoundCount();
  const reward = await getSocialRewardsAmount();
  const duration = await getSocialRewardsRoundDuration();
  const round = await getSocialRewardsRound({ id });

  return (
    <div className="flex flex-col justify-center items-center w-full">
      <div className="flex justify-center items-center w-full bg-[#DDF5DD] px-10 lg:px-0 pb-8 sm:pb-0">
        <div className="container max-w-screen-lg">
          <Header />
          <SocialRound
            id={id}
            round={round}
            reward={reward}
            duration={duration}
          />
        </div>
      </div>

      <div className="flex justify-center items-center w-full px-10 lg:px-0 mt-16 mb-24">
        <Footer />
      </div>
    </div>
  );
}
