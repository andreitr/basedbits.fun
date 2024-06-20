export const truncateAddress = (address: string) => {
  return `${address.substring(0, 6)}....${address.substring(address.length - 4, address.length)}`;
};

export const rainbowURI = (address: string) => {
  return `https://rainbow.me/profile/${address}`;
};
