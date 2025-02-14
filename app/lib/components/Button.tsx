import { Spinner } from "@/app/lib/components/Spinner";

interface Props {
  onClick: () => void;
  loading: boolean;
  children: React.ReactNode;
  className?: string;
}

export const Button = ({ onClick, loading, children, className }: Props) => {
  return (
    <button
      onClick={onClick}
      className={`flex sm:w-[360px] w-full h-[50px] items-center justify-center  bg-[#303730] text-[#DDF5DD] hover:bg-[#677467] text:bg-[#FFFF00] hover:text-white text-xl font-bold py-3 px-4 rounded-lg cursor-pointer ${className}`}
      disabled={loading}
    >
      {loading ? <Spinner /> : children}
    </button>
  );
};
