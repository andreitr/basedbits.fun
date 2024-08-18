interface Props {
    onClick: () => void;
    loading: boolean;
    children: React.ReactNode;
}

export const Button = ({onClick, loading, children}: Props) => {
    return (
        <button
            onClick={onClick}
            className="bg-[#303730] text-[#DDF5DD] hover:bg-[#677467] text:bg-[#FFFF00] hover:text-white text-xl font-bold py-3 px-4 rounded-lg w-full"
            disabled={loading}
        >
            {children}
        </button>
    );
};
