"use client";

import { DateTime } from "luxon";
import { useEffect, useState } from "react";
import NumberFlow from "@number-flow/react";

interface Props {
  hour: number;
}

export const CountDown = ({ hour }: Props) => {
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const calculateRemainingTime = () => {
      const now = DateTime.utc();
      const nextTargetHour =
        now.hour >= hour
          ? now
              .plus({ days: 1 })
              .set({ hour: hour, minute: 0, second: 0, millisecond: 0 })
          : now.set({ hour: hour, minute: 0, second: 0, millisecond: 0 });

      const remainingTime = nextTargetHour.diff(now, [
        "hours",
        "minutes",
        "seconds",
      ]);
      setHours(remainingTime.hours);
      setMinutes(remainingTime.minutes);
      setSeconds(remainingTime.seconds);
    };

    const interval = setInterval(calculateRemainingTime, 1000);

    calculateRemainingTime();

    return () => clearInterval(interval);
  }, [hour]);

  return (
    <div>
      <NumberFlow
        value={hours}
        trend={-1}
        digits={{ 1: { max: 5 } }}
        format={{ minimumIntegerDigits: 2 }}
      />
      <NumberFlow
        value={Math.floor(minutes)}
        prefix=":"
        trend={-1}
        digits={{ 1: { max: 5 } }}
        format={{ minimumIntegerDigits: 2 }}
      />
      <NumberFlow
        value={Math.floor(seconds)}
        prefix=":"
        trend={-1}
        digits={{ 1: { max: 5 } }}
        format={{ minimumIntegerDigits: 2 }}
      />
    </div>
  );
};
