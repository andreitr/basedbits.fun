"use server";

import { Header } from "@/app/lib/components/client/Header";
import { Footer } from "@/app/lib/components/Footer";
import { getRecentCheckIns } from "@/app/lib/api/getRecentCheckIns";
import { UserList } from "@/app/here/components/UserList";

export default async function Page() {
  const users = await getRecentCheckIns();

  return (
    <div className="flex flex-col justify-center items-center w-full">
      <div className="flex justify-center items-center w-full bg-[#DDF5DD] px-10 lg:px-0 pb-8 sm:pb-0">
        <div className="container max-w-screen-lg mb-8">
          <Header />

          <div className="flex justify-center items-center w-full bg-[#DDF5DD] px-10 lg:px-0 pb-8 sm:pb-0">
            <div className="container max-w-screen-lg mb-10">
              <div className="text-4xl text-[#363E36]">
                {users.length} Users are here!
              </div>
            </div>
          </div>

          <UserList users={users} />
        </div>
      </div>

      <div className="flex justify-center items-center w-full px-10 lg:px-0 mt-16 mb-24">
        <Footer />
      </div>
    </div>
  );
}
