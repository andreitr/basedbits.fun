export type AlchemyResponse = {
  ownedNfts: AlchemyToken[];
  totalCount: number;
  pageKey: string;
};

export type AlchemyToken = {
  tokenId: string;
  name: string;
  image: {
    pngUrl: string;
    thumbnailUrl: string;
    originalUrl: string;
  };
};
