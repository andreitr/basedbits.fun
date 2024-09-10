import Image from "next/image";
import Link from "next/link";

interface Props {
  title: string;
  description: string;
  image: string;
  link: string;
}

export const FeatureCard = ({ title, description, image, link }: Props) => {
  const target = link.startsWith("http") ? "_blank" : "_self";

  return (
    <Link
      href={link}
      target={target}
      className="flex flex-row gap-4 rounded-lg bg-white bg-opacity-20 w-full"
    >
      <Image
        className="rounded-lg w-[80px] h-[80px] bg-[#DDF5DD]"
        src={image}
        alt={title}
        width={80}
        height={80}
      />
      <div className="flex flex-col justify-center pr-4 text-sm">
        <div>{title}</div>
        <div>{description}</div>
      </div>
    </Link>
  );
};
