import { Header } from "@/app/lib/components/client/Header";
import { Footer } from "@/app/lib/components/Footer";
import { MintComponent } from "@/app/burn/components/MintComponent";
import { Tabs } from "@/app/burn/components/Tabs";
import { fetchMintPrice } from "@/app/burn/api/fetchMintPrice";

// Static page regenerated in the background; the mint price keeps polling on the client
export const revalidate = 60;

export async function generateMetadata() {
  const ogPreviewPath = `${process.env.NEXT_PUBLIC_URL}/api/images/burn`;

  const title = "Burned Bits";
  const description = "Mint a Burned Bit to burn a Based Bit!";

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
  const mintPrice = await fetchMintPrice();

  return (
    <div className="flex flex-col justify-center items-center w-full">
      <div className="flex justify-center items-center w-full bg-[#DDF5DD] sm:px-10 pb-8 sm:pb-0">
        <div className="container max-w-screen-lg">
          <div className="px-5 sm:px-0">
            <Header />
          </div>
          <MintComponent initialMintPrice={mintPrice} />
          <div className="mt-10 mb-10 px-5 sm:px-0">
            <Tabs />
          </div>
        </div>
      </div>

      <div className="flex justify-center items-center w-full px-5 sm:px-10 mt-16 mb-24">
        <Footer />
      </div>
    </div>
  );
}
