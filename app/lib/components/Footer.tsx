import Link from "next/link";
import fire from "@/app/lib/icons/fire.svg";
import Image from "next/image";

export const Footer = () => {
  return (
    <div className="container max-w-screen-lg">
      <div className="text-5xl text-[#363E36] mb-4">Based Bits</div>
      <div className="text-[#677467]">
        8000 Based Bits causing byte-sized mischief on the BASE chain, a nerdy
        collection by{" "}
        <Link
          href="https://warpcast.com/andreitr"
          target="_blank"
          title="andreitr.eth on Farcaster"
        >
          andreitr.eth
        </Link>{" "}
        with art by{" "}
        <Link
          href="https://warpcast.com/gretagremplin"
          target="_blank"
          title="gretagremplin on Farcaster"
        >
          gretagremplin.eth
        </Link>
        . All art is CC0.
      </div>

      <div className="flex sm:flex-row gap-8 flex-col justify-between mt-16 text-[#677467]">
        <div>
          <div className="text-xl text-[#363E36] mb-2">Marketplaces</div>
          <div>
            <Link
              className="hover:underline text-sm"
              href="https://rarible.com/BasedBits/items"
              target="_blank"
            >
              Rarible
            </Link>
          </div>
          <div>
            <Link
              className="hover:underline text-sm"
              href="https://opensea.io/collection/based-bits"
              target="_blank"
            >
              OpenSea
            </Link>
          </div>
        </div>
        <div>
          <div className="text-xl text-[#363E36] mb-2">Socials</div>
          <div>
            <Link
              className="hover:underline text-sm"
              href="https://warpcast.com/basedbits"
              target="_blank"
            >
              @basedbits on warpcast
            </Link>
          </div>
          <div>
            <Link
              className="hover:underline text-sm"
              href="https://x.com/basedbits_fun"
              target="_blank"
            >
              @basedbits_fun on x
            </Link>
          </div>

          <div className="mt-4">
            <Link
              className="hover:underline text-sm"
              href="https://warpcast.com/andreitr.eth"
              target="_blank"
            >
              @andreitr on warpcast
            </Link>
          </div>
          <div>
            <Link
              className="hover:underline text-sm"
              href="https://x.com/andreitr"
              target="_blank"
            >
              @andreitr on x
            </Link>
          </div>
          <div>
            <Link
              className="hover:underline text-sm"
              href="mailto:andrei.taraschuk@gmail.com"
              target="_blank"
            >
              email andrei
            </Link>
          </div>
        </div>

        <div>
          <div className="text-xl text-[#363E36] mb-2">Token</div>
          <div>
            <Link
              className="hover:underline text-sm"
              href="https://app.uniswap.org/explore/tokens/base/0x553C1f87C2EF99CcA23b8A7fFaA629C8c2D27666?chain=base"
              target="_blank"
            >
              BBITS on Uniswap
            </Link>
          </div>
          <div>
            <Link
              className="hover:underline text-sm"
              href="https://app.uniswap.org/pools/685175?chain=base"
              target="_blank"
            >
              BBITS Liquidity Pool
            </Link>
          </div>
        </div>

        <div>
          <div className="text-xl text-[#363E36] mb-2">Contracts</div>
          <div>
            <Link
              className="hover:underline text-sm"
              href="https://basescan.org/address/0x617978b8af11570c2dab7c39163a8bde1d282407"
              target="_blank"
            >
              NFT Contract
            </Link>
          </div>
          <div>
            <Link
              className="hover:underline text-sm"
              href="https://basescan.org/address/0x553c1f87c2ef99cca23b8a7ffaa629c8c2d27666"
              target="_blank"
            >
              Token Contract
            </Link>
          </div>
          <div>
            <Link
              className="hover:underline text-sm"
              href="https://basescan.org/address/0x1595409cbaef3dd2485107fb1e328fa0fa505c10"
              target="_blank"
            >
              Token Burner Contract
            </Link>
          </div>
          <div>
            <Link
              className="hover:underline text-sm"
              href="https://basescan.org/address/0x8b9ef77160bb4da3ce32805d6833b395d63a4a94"
              target="_blank"
            >
              Raffle Contract
            </Link>
          </div>
          <div>
            <Link
              className="hover:underline text-sm"
              href="https://basescan.org/address/0xe842537260634175891925f058498f9099c102eb"
              target="_blank"
            >
              Check-in Contract
            </Link>
          </div>

          <div>
            <Link
              className="hover:underline text-sm"
              href="https://basescan.org/address/0xe0e68930a8cc0c066bb96183870c9949f5396ea8"
              target="_blank"
            >
              Social Contract
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
