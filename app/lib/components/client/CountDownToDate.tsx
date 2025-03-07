"use client";

import { DateTime } from "luxon";
import { useEffect, useState } from "react";
import NumberFlow from "@number-flow/react";

interface Props {
  targetDate: number; // Unix timestamp
  message: string;
}

export const CountDownToDate = ({ targetDate, message }: Props) => {
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [isPassed, setIsPassed] = useState(false);

  useEffect(() => {
    const calculateRemainingTime = () => {
      const now = DateTime.utc();
      const target = DateTime.fromSeconds(targetDate);

      if (now >= target) {
        setIsPassed(true);
        setHours(0);
        setMinutes(0);
        setSeconds(0);
        return;
      }

      const remainingTime = target.diff(now, ["hours", "minutes", "seconds"]);
      setHours(remainingTime.hours);
      setMinutes(remainingTime.minutes);
      setSeconds(remainingTime.seconds);
    };

    const interval = setInterval(calculateRemainingTime, 1000);

    calculateRemainingTime();

    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <div>
      {isPassed ? (
        <div>{message}</div>
      ) : (
        <div>
          {hours > 0 && (
            <NumberFlow
              value={hours}
              trend={-1}
              digits={{ 1: { max: 5 } }}
              format={{ minimumIntegerDigits: 2 }}
            />
          )}
          <NumberFlow
            value={minutes}
            prefix={hours > 0 ? ":" : undefined}
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
      )}
    </div>
  );
};
