import Image from "next/image";

export const MintComponent = () => {
  return (
    <div className="w-full flex flex-col md:flex-row gap-10 sm:gap-20 justify-between bg-black bg-opacity-90 text-white rounded-lg p-6">
      <div>
        <div className="text-5xl mb-2 text-[#82BCFC]">Base Race</div>
        <div className="">
          Every day at 7 UTC, a new race begins. Survive 6 laps, use boosts
          strategically, and compete to win the prize pool.
        </div>
        <div className="mt-10 mb-10">Coming Soon...</div>
        <div className="text-sm text-[#82BCFC]">
          80% of proceeds go to the prize pool; 20% are burned via BBITS.
        </div>
      </div>
      <div>
        <Image
          className="rounded-lg"
          src={"/images/race.svg"}
          alt="Preview"
          width="540"
          height="540"
        />
      </div>
    </div>
  );
};
