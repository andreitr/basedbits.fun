import FarcasterIcon from "@/app/lib/icons/farcaster.svg";
import CloseIcon from "@/app/lib/icons/x-mark.svg";
import XIcon from "@/app/lib/icons/x.svg";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";

interface Props {
  message: string;
  title: string;
  url: string;
}

export const useSocialDisplay = ({ message, title, url }: Props) => {
  const show = () => {
    // Check if a social display toast is already visible
    const existingToast = document.querySelector('[data-testid="social-display-toast"]');
    if (existingToast) {
      return;
    }

    const encodedText = encodeURIComponent(message);

    toast.custom(
      (t) => (
        <div
          data-testid="social-display-toast"
          className="max-w-md w-full bg-black bg-opacity-80 rounded-lg pointer-events-auto ring-1 ring-black text-white p-5"
        >
          <div className="flex flex-col justify-end gap-5">
            <div className="flex flex-row justify-between items-start">
              <div>{title}</div>
              <button onClick={() => toast.dismiss(t.id)}>
                <Image src={CloseIcon} alt="Close" width={40} height={40} />
              </button>
            </div>
            <div className="flex flex-row mt-6 gap-6 justify-center">
              <Link
                className="flex flex-row rounded-md border-white border px-3 py-2 w-full justify-center items-center"
                href={`https://warpcast.com/~/compose?text=${encodedText}&&embeds[]=${url}`}
                target="_blank"
              >
                Share on{" "}
                <Image
                  className="ml-3"
                  src={FarcasterIcon}
                  width={16}
                  height={16}
                  alt="Share on Farcaster"
                />
              </Link>
              <Link
                className="flex flex-row rounded-md border-white border px-3 py-2 w-full justify-center items-center"
                href={`https://x.com/intent/post?text=${encodedText}&&url=${url}`}
                target="_blank"
              >
                Share on{" "}
                <Image
                  className="ml-3"
                  src={XIcon}
                  width={16}
                  height={16}
                  alt="Share on X"
                />
              </Link>
            </div>
          </div>
        </div>
      ),
      {
        duration: 50000,
        position: "bottom-right",
      },
    );
  };

  return { show };
};
