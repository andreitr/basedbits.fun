"use server";

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
        <div className="container max-w-screen-lg">
          <Header />

          <div className="flex flex-col gap-4">
            <div className="text-xl font-semibold">Purchase History</div>
            <table className="w-full text-left">
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
