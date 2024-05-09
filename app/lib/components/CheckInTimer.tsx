import BigNumber from "bignumber.js";
import {DateTime, Duration, Interval} from 'luxon';
import {useEffect, useState} from "react";

interface CheckInTimerProps {
    time: BigNumber;
}

export const CheckInTimer = ({time}: CheckInTimerProps) => {

    const [timer, setTimer] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => {
            setTimer(new Date());
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const lastCheckinTime = DateTime.fromMillis(BigNumber(time).toNumber() * 1000);
    const elapsedTime = Interval.fromDateTimes(lastCheckinTime, DateTime.now());

    const remainingTime = Duration.fromObject({hours: 24}).minus(elapsedTime.toDuration('hours'));
    const remainingTimeString = remainingTime.toFormat('hh:mm:ss');


    return <div>
        {remainingTime.as('milliseconds') > 0 && (
            <div className="text-[#677467]">Next checkin-in window opens in <span className="font-bold">{remainingTimeString}</span></div>
        )}
    </div>
}