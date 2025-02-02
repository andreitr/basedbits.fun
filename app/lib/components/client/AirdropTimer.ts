"use client";

import { DateTime } from "luxon";
import { useEffect, useState } from "react";

export const AirdropTimer = () => {
  const [remainingTimeString, setRemainingTimeString] = useState("00:00:00");

  useEffect(() => {
    const calculateRemainingTime = () => {
      const now = DateTime.utc();
      const next7UTC =
        now.hour >= 7
          ? now
              .plus({ days: 1 })
              .set({ hour: 7, minute: 0, second: 0, millisecond: 0 })
          : now.set({ hour: 7, minute: 0, second: 0, millisecond: 0 });

      const remainingTime = next7UTC.diff(now, ["hours", "minutes", "seconds"]);
      setRemainingTimeString(remainingTime.toFormat("hh:mm:ss"));
    };

    const interval = setInterval(calculateRemainingTime, 1000);

    calculateRemainingTime();

    return () => clearInterval(interval);
  }, []);

  return remainingTimeString;
};
