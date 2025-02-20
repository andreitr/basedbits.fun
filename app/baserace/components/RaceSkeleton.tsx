export const RaceSkeleton = () => {
  return (
    <div className="grid grid-cols-4 w-full p-6 bg-black rounded-lg bg-opacity-30 animate-pulse h-[210px]">
      <div className="col-span-3 justify-between">
        <div className="flex flex-col justify-between h-full"></div>
      </div>
      <div className="bg-black bg-opacity-30 rounded-lg"></div>
    </div>
  );
};
