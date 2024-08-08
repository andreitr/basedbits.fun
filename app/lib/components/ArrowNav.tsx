import Link from "next/link";
import Image from "next/image";
import leftArrow from "@/app/lib/icons/arrow-left.svg";
import rightArrow from "@/app/lib/icons/arrow-right.svg";

interface Props {
  hasNext: boolean;
  id: number;
  path: string;
}

export const ArrowNav = ({ id, path, hasNext }: Props) => {
  return (
    <div className="flex flex-row gap-2">
      <Link
        className="cursor-pointer"
        href={id > 1 ? `/${path}/${Number(id) - 1}` : `/${path}/${Number(id)}`}
      >
        <div
          className={`bg-white rounded-full p-2 ${id > 1 ? "cursor-pointer hover:bg-[#ABBEAC] opacity-70" : "opacity-40"}`}
        >
          <Image className="w-4" src={leftArrow} alt="Previous" />
        </div>
      </Link>

      <Link
        href={hasNext ? `/${path}/${Number(id) + 1}` : `/${path}/${Number(id)}`}
      >
        <div
          className={`bg-white rounded-full p-2 ${hasNext ? "cursor-pointer hover:bg-[#ABBEAC] opacity-70" : "opacity-40"}`}
        >
          <Image className="w-4" src={rightArrow} alt="Next" />
        </div>
      </Link>
    </div>
  );
};
