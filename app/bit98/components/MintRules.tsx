import Link from "next/link";

export const MintRules = () => {
  return (
    <div className="flex flex-col gap-4 mb-8">
      <div className="hidden md:inline mb-4">
        Bit98 is a collab between{" "}
        <Link
          className="hover:no-underline underline text-[#0000FF]"
          href="https://filter8.xyz/"
          target="_blank"
        >
          Filter8
        </Link>{" "}
        and Based Bits. A new Bit98 is bleeped into existence every 4 hours! A
        single edition is raffled off at the end of each mint! There can only be
        512 unique Bit98s.
      </div>

      <div className="flex flex-col gap-2 p-4 bg-black bg-opacity-10 rounded-lg">
        <li>All minters are entered into a raffle for a Single Edition.</li>
        <li>
          The more Bit98 NFTs you hold, the more raffle entries you receive.
        </li>
        <li>Starting a new mint gets you a free NFT.</li>
        <li>Check-in streaks = mint discounts.</li>
        <li>
          80% of mint proceeds are sent to the artist, 20% burned via BBITS
        </li>
      </div>
    </div>
  );
};
