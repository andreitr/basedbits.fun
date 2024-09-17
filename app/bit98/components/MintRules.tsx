export const MintRules = () => {
  return (
    <div className="flex flex-col gap-2 p-4 bg-black bg-opacity-10 rounded-lg">
      <li>All minters are entered into a raffle for a 1:1 NFT.</li>
      <li>A raffled NFT is generated and sent at the end of the mint.</li>
      <li>The more Bit98's you hold, the more raffle entries you receive.</li>
      <li>Starting a new mint grants you a free NFT.</li>
      <li>
        Check-in streaks = mint discounts. 1 day = 1% off (up to a max of 90%)
      </li>
    </div>
  );
};
