import BigNumber from "bignumber.js";
import { DateTime, Duration, Interval } from "luxon";
import { useEffect, useState } from "react";

interface Props {
  startTime: BigNumber;
  duration: number;
  startTitle: string;
  endTitle: string;
}

export const ElapsedTimer = ({
  startTime,
  duration,
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

  const startDateTime = DateTime.fromMillis(
    BigNumber(startTime).toNumber() * 1000,
  );
  const endDateTime = DateTime.fromMillis(
    BigNumber(startTime).toNumber() * 1000,
  );

  const elapsedTime = Interval.fromDateTimes(startDateTime, DateTime.now());
  const remainingTime = Duration.fromObject({ hours: duration }).minus(
    elapsedTime.toDuration("hours"),
  );
  const remainingTimeString = remainingTime.toFormat("hh:mm:ss");

  return (
    <div>
      {remainingTime.as("milliseconds") > 0 ? (
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
            {endDateTime.monthLong} {endDateTime.day},{endDateTime.year}
          </div>
        </div>
      )}
    </div>
  );
};
