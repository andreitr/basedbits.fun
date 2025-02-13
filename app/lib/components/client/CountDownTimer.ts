"use client";

import { DateTime } from "luxon";
import { useEffect, useState } from "react";

interface Props {
  hour: number;
}

export const CountDownTimer = ({ hour }: Props) => {
  const [remainingTimeString, setRemainingTimeString] = useState("00:00:00");

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
      setRemainingTimeString(remainingTime.toFormat("hh:mm:ss"));
    };

    const interval = setInterval(calculateRemainingTime, 1000);

    calculateRemainingTime();

    return () => clearInterval(interval);
  }, [hour]);

  return remainingTimeString;
};
