import { DateTime } from "luxon";
import { useEffect, useState } from "react";

interface Props {
  start: DateTime;
  end: DateTime;
  startTitle: string;
  endTitle: string;
}

export const SocialRoundTimer = ({
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

  const remainingTimeString = end.diffNow().toFormat("d:hh:mm:ss");

  const days = remainingTimeString.split(":")[0];
  const hrs = remainingTimeString.split(":")[1];
  const mins = remainingTimeString.split(":")[2];
  const secs = remainingTimeString.split(":")[3];

  return (
    <div>
      {end.diffNow().milliseconds > 0 ? (
        <div className="flex flex-row gap-4">
          <div className="flex flex-col">
            <div className="text-gray-500 text-xs uppercase">DAYS</div>
            <div className="text-2xl font-semibold text-[#363E36]">{days}</div>
          </div>
          <div className="flex flex-col">
            <div className="text-gray-500 text-xs uppercase">Hours</div>
            <div className="text-2xl font-semibold text-[#363E36]">{hrs}</div>
          </div>
          <div className="flex flex-col">
            <div className="text-gray-500 text-xs uppercase">MINS</div>
            <div className="text-2xl font-semibold text-[#363E36]">{mins}</div>
          </div>
          <div className="flex flex-col">
            <div className="text-gray-500 text-xs uppercase">SECS</div>
            <div className="text-2xl font-semibold text-[#363E36]">{secs}</div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col text-2xl font-semibold text-[#363E36]">
          {end.monthShort} {end.day},{end.year}
        </div>
      )}
    </div>
  );
};
