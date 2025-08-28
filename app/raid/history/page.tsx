"use server";

import { CountDownToDate } from "@/app/lib/components/client/CountDownToDate";
import { Header } from "@/app/lib/components/client/Header";
import { Footer } from "@/app/lib/components/Footer";
import { potraiderContract } from "@/app/lib/contracts/potraider";
import { formatUnits } from "ethers";

export async function generateMetadata() {
  const contract = potraiderContract();
  const jackpot = await contract.getLotteryJackpot();
  const jackpotFormatted = Number(formatUnits(jackpot, 6)).toLocaleString(
    "en-US",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
  );

  const title = "Pot Raiders";
  const description = `For a full year, Pot Raiders will spend a share of the treasury on Megapot tickets. Current jackpot: $${jackpotFormatted}`;
  const ogPreviewPath = `${process.env.NEXT_PUBLIC_URL}/api/images/raid`;

  return {
    title: title,
    description: description,

    openGraph: {
      images: [
        {
          url: ogPreviewPath,
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: title,
      description,
    },
  };
}

export default async function Page() {
  const contract = potraiderContract();

  const currentDay = await contract.currentLotteryDay();
  const latestDay = currentDay > 0 ? Number(currentDay) : 0;
  const days = Array.from({ length: latestDay + 1 }, (_, i) => i);

  const history = await Promise.all(
    days.map((day) => contract.lotteryPurchaseHistory(day)),
  );

  return (
    <div className="flex flex-col justify-center items-center w-full">
      <div className="flex justify-center items-center w-full bg-[#DDF5DD] px-0 lg:px-10 pb-8 sm:pb-0">
        <div className="container max-w-screen-lg px-5 sm:px-0">
          <Header />

          <div className="flex flex-col gap-4">
            <div className="text-2xl font-semibold">
              Megapot Ticket Purchase History
            </div>
            <div className="flex flex-wrap gap-7 w-full">
              {history[currentDay] && (
                <div className="flex flex-col gap-1">
                  <div className="uppercase text-xs text-gray-600">
                    next ticket purchase
                  </div>
                  <div className="text-2xl">
                    {
                      <CountDownToDate
                        targetDate={Number(history[currentDay][1]) + 86400}
                        message="Raiding Now!"
                      />
                    }
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-1">
                <div className="uppercase text-xs text-gray-600">progress</div>
                <div className="text-2xl">{currentDay}/365</div>
              </div>
              <div className="flex flex-col gap-1">
                <div className="uppercase text-xs text-gray-600">
                  tix bought
                </div>
                <div className="text-2xl">
                  {history
                    .reduce((acc, [tickets]) => acc + Number(tickets), 0)
                    .toString()}
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <div className="uppercase text-xs text-gray-600">
                  est tix left
                </div>
                <div className="text-2xl">
                  {(365 - Number(currentDay)) * Number(history[currentDay][0])}
                </div>
              </div>
            </div>
            <div>
              The Pot Raiders purchase Megapot tickets every day at 7UTC. The
              number of tickets is calculated dynamically based on the treasury
              amount divided by the number of remaining days!
            </div>

            <table className="w-full text-left mt-4 mb-12">
              <thead>
                <tr className="border-b border-gray-300 text-sm">
                  <th className="py-2">Day</th>
                  <th className="py-2">Timestamp</th>
                  <th className="py-2">Tickets</th>
                </tr>
              </thead>
              <tbody>
                {history
                  .map((entry, index) => ({ day: days[index], entry }))
                  .reverse()
                  .filter(({ day }) => day > 0)
                  .map(({ day, entry }) => (
                    <tr
                      key={day}
                      className="border-b border-gray-200 last:border-b-0"
                    >
                      <td className="py-2">{day}</td>
                      <td className="py-2">
                        {Number(entry[1]) > 0
                          ? new Date(Number(entry[1]) * 1000).toLocaleString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )
                          : "-"}
                      </td>
                      <td className="py-2">{entry[0].toString()}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="flex justify-center items-center w-full px-10 lg:px-0 mt-16 mb-24">
        <Footer />
      </div>
    </div>
  );
}
