export type AlchemyUserResponse = {
  ownedNfts: AlchemyToken[];
  totalCount: number;
  pageKey: string;
};
export type AlchemyCollectionResponse = {
  nfts: AlchemyToken[];
  totalCount: number;
  pageKey: string;
};

export type AlchemyCollection = {
  name: string;
  totalSupply: string;
};
export type AlchemyToken = {
  tokenId: string;
  name: string;
  contract: {
    address: string;
  };
  image: {
    pngUrl: string;
    thumbnailUrl: string;
    originalUrl: string;
  };
};
