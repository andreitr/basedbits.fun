import { DateTime } from "luxon";
import { useEffect, useState } from "react";

interface Props {
  start: DateTime;
  end: DateTime;
  startTitle: string;
  endTitle: string;
}

export const ElapsedTimerNew = ({
  start,
  end,
  startTitle,
  endTitle,
}: Props) => {
  const [, setTimer] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const remainingTimeString = end.diffNow().toFormat("d hh:mm:ss");

  return (
    <div>
      {end.diffNow().milliseconds > 0 ? (
        <div className="flex flex-col">
          <div className="text-md text-[#677467]">{startTitle}</div>
          <div className="text-3xl font-semibold text-[#363E36]">
            {remainingTimeString}
          </div>
        </div>
      ) : (
        <div className="flex flex-col">
          <div className="text-md text-[#677467]">{endTitle}</div>
          <div className="text-3xl font-semibold text-[#363E36]">
            {end.monthShort} {end.day},{end.year}
          </div>
        </div>
      )}
    </div>
  );
};
