"use server";

import { Header } from "@/app/lib/components/Header";
import { Footer } from "@/app/lib/components/Footer";
import Image from "next/image";
import { MintRules } from "@/app/emojibits/components/MintRules";

export default async function Page() {
  return (
    <div className="flex flex-col justify-center items-center w-full">
      <div className="flex justify-center items-center w-full bg-[#DDF5DD] px-10 lg:px-0 pb-8 sm:pb-0">
        <div className="container max-w-screen-lg">
          <Header />

          <div className="flex flex-col gap-6 mb-8">
            <div className="text-4xl">
              Emoji Bits dropping on August 20, 2024
            </div>

            <div>
              Inspired by the oldest known emoji collection (
              <a
                className="underline"
                href="https://blog.gingerbeardman.com/2024/05/10/emoji-history-the-missing-years/"
                target="_blank"
              >
                Sharp PI-4000, 1994
              </a>
              ), Emoji Bits is a fully on-chain NFT collection featuring
              experimental minting and gamification mechanisms.
            </div>

            <div className="flex flex-row gap-2 justify-between">
              <Image
                className="rounded-lg"
                src="/images/emojibit_1.png"
                alt={"Emoji Bit Preview"}
                width={180}
                height={180}
              />
              <Image
                className="rounded-lg"
                src="/images/emojibit_3.png"
                alt={"Emoji Bit Preview"}
                width={180}
                height={180}
              />
              <Image
                className="rounded-lg hidden sm:block"
                src="/images/emojibit_2.png"
                alt={"Emoji Bit Preview"}
                width={180}
                height={180}
              />
              <Image
                className="rounded-lg hidden md:block"
                src="/images/emojibit_4.png"
                alt={"Emoji Bit Preview"}
                width={180}
                height={180}
              />
              <Image
                className="rounded-lg hidden lg:block"
                src="/images/emojibit_5.png"
                alt={"Emoji Bit Preview"}
                width={180}
                height={180}
              />
            </div>

            <div>
              Every 8 hours, forever, a new Emoji Bit is born! 50% of mint
              proceeds are raffled off to one lucky winner, while the rest are
              used to burn BBITS tokens.
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
