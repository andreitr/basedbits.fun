import { Header } from "@/app/lib/components/Header";

import { Footer } from "@/app/lib/components/Footer";
import { MintRules } from "@/app/bit98/components/MintRules";

export default async function Page() {
  return (
    <div className="flex flex-col justify-center items-center w-full">
      <div className="flex justify-center items-center w-full bg-[#DDF5DD] px-10 lg:px-0 pb-8 sm:pb-0">
        <div className="container max-w-screen-lg">
          <Header />

          <div className="flex flex-col gap-6 mb-8">
            <div className="text-4xl">Bit98</div>
            <div className="hidden md:inline">
              A new Bit98 is born every 4 hours! Every minter has a chance of
              winning 1:1 at the end of the mint.
            </div>
            <MintRules />
          </div>
        </div>
      </div>

      <div className="flex justify-center items-center w-full px-10 lg:px-0 mt-16 mb-24">
        <Footer />
      </div>
    </div>
  );
}
