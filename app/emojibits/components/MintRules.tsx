export const MintRules = () => {
  return (
    <div className="flex flex-col gap-2 p-4 bg-black bg-opacity-10 rounded-lg">
      <li>All minters are entered into a raffle.</li>
      <li>Raffle rewards are sent at the end of the mint period.</li>
      <li>The more Emoji Bits you hold, the more raffle entries you get.</li>

      <li>Starting a new mint gets you a free Emoji Bit.</li>
      <li>
        Check-in streaks = mint discounts. 1 day = 1% off (up to a max of 90%)
      </li>
    </div>
  );
};
