import Link from "next/link";
import fire from "@/app/lib/icons/fire.svg";
import Image from "next/image";

export const Footer = () => {
  return (
    <div className="container max-w-screen-lg">
      <div className="text-5xl text-[#363E36] mb-4">Based Bits</div>
      <div className="text-[#677467]">
        Based Bits is a community centered around building experimental and fun
        NFT use cases. Join us! Grab a Based Bit NFT and start checking in.
      </div>

      <div className="flex sm:flex-row gap-8 flex-col justify-between mt-16 text-[#677467]">
        <div>
          <div className="text-xl text-[#363E36] mb-2">NFT Collections</div>
          <div>
            <Link
              className="hover:underline text-sm"
              href={`https://opensea.io/assets/base/${process.env.NEXT_PUBLIC_BB_NFT_ADDRESS}`}
              target="_blank"
            >
              Based Bits
            </Link>
          </div>
          <div>
            <Link className="hover:underline text-sm" href={"/aeye"}>
              AEYE: Genesis
            </Link>
          </div>
          <div>
            <Link className="hover:underline text-sm" href={"/burn"}>
              Burned Bits
            </Link>
          </div>
          <div>
            <Link className="hover:underline text-sm" href={"/punks"}>
              Punkalot
            </Link>
          </div>
          <div>
            <Link
              className="hover:underline text-sm"
              href={`https://opensea.io/assets/base/${process.env.NEXT_PUBLIC_BB_EMOJI_BITS_ADDRESS}`}
              target="_blank"
            >
              Emoji Bits (Onchain Summer)
            </Link>
          </div>
          <div>
            <Link
              className="hover:underline text-sm"
              href={`https://opensea.io/assets/base/${process.env.NEXT_PUBLIC_BB_BIT98_ADDRESS}`}
              target="_blank"
            >
              Bit98
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
              href={`https://basescan.org/address/${process.env.NEXT_PUBLIC_BB_CHECKINS_ADDRESS}`}
              target="_blank"
            >
              Check-in Contract
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
              href={`https://basescan.org/address/${process.env.NEXT_PUBLIC_AEYE_ADDRESS}`}
              target="_blank"
            >
              AEYE: Genesis Contract
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
