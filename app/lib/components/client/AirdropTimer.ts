"use client";

import { DateTime, Duration, Interval } from "luxon";
import { useEffect, useState } from "react";

export const AirdropTimer = () => {
  const [, setTimer] = useState(new Date());

  const startTime = DateTime.utc().set({
    hour: 7,
    minute: 0,
    second: 0,
    millisecond: 0,
  });
  const startDateTime = DateTime.fromMillis(startTime.toMillis());

  const elapsedTime = Interval.fromDateTimes(startDateTime, DateTime.now());
  const remainingTime = Duration.fromObject({ hours: 24 }).minus(
    elapsedTime.toDuration("hours"),
  );

  const remainingTimeString = remainingTime.toFormat("hh:mm:ss");

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return remainingTimeString;
};
