"use server";

import { Header } from "@/app/lib/components/client/Header";
import { Footer } from "@/app/lib/components/Footer";
import { getRecentCheckIns } from "@/app/lib/api/getRecentCheckIns";
import Link from "next/link";

export default async function Page() {
  const checkins = await getRecentCheckIns();

  return (
    <div className="flex flex-col justify-center items-center w-full">
      <div className="flex justify-center items-center w-full bg-[#DDF5DD] px-10 lg:px-0 pb-8 sm:pb-0">
        <div className="container max-w-screen-lg">
          <Header />
          <div className="flex flex-col gap-2">
            {checkins.map((checkin, index) => {
              return (
                <div key={index}>
                  <Link
                    className={"underline text-link"}
                    href={`/users/${checkin}`}
                  >
                    {checkin}
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex justify-center items-center w-full px-10 lg:px-0 mt-16 mb-24">
        <Footer />
      </div>
    </div>
  );
}
