export type Collection = {
    meta: {
        name: string;
        description: string;
        content: any[];
    }
}

export type CollectionStats = {
    highestSale: number,
    floorPrice: any,
    marketCap: number,
    listed: number,
    items: number,
    owners: number,
    volume: number
}

export type NFT = {
    tokenId: string;
    meta: {
        name: string,
        description: string,
        content: any[]
    },
    lastSale: {
        date: string,
        currency: {
            "@type": string,
        },
        price: string,
    } | null,
}

export type RariblePreview = {
    '@type': 'IMAGE',
    url: string;
    representation: 'ORIGINAL' | 'PREVIEW';
    mimeType: string;
    size: number,
    available: boolean,
    width: number,
    height: number
}

export function previewImage(nft: NFT | Collection): RariblePreview | undefined {
    let preview, bigRes, originalRes;
    for (const itm of nft.meta.content || []) {
        if (itm["@type"] === "IMAGE") {
            // Check for PREVIEW
            if (!preview && itm["representation"] === "PREVIEW") {
                preview = itm;
            }
            // Check for BIG
            else if (!bigRes && itm["representation"] === "BIG") {
                bigRes = itm;
            }
            // Check for ORIGINAL
            else if (!originalRes && itm["representation"] === "ORIGINAL") {
                originalRes = itm;
            }
        }
    }
    // Return in order of preference: BIG, PREVIEW, ORIGINAL
    return bigRes || preview || originalRes;
}

export async function getNFT(blockchain: string, address: string, id: string) {

    const API_KEY: string = process.env.RARIBLE_API_KEY || ""
    const API_PATH: string = process.env.RARIBLE_API_PATH || "";

    const res = await fetch(`${API_PATH}/items/${blockchain.toUpperCase()}:${address}:${id}`,
        {
            headers: {
                "x-api-key": API_KEY,
            }
        })
    return res.json()
}

export async function getCollection(blockchain: string, address: string) {

    const API_KEY: string = process.env.RARIBLE_API_KEY || ""
    const API_PATH: string = process.env.RARIBLE_API_PATH || "";

    const res = await fetch(`${API_PATH}/collections/${blockchain.toUpperCase()}:${address}`,
        {
            headers: {
                "x-api-key": API_KEY,
            }
        })
    return res.json()
}

export async function getCollectionStats(blockchain: string, address: string) {

    const API_KEY: string = process.env.RARIBLE_API_KEY || ""
    const API_PATH: string = process.env.RARIBLE_API_PATH || "";


    const res = await fetch(`${API_PATH}/data/collections/${blockchain.toUpperCase()}:${address}/stats?currency=ETH`,
        {
            headers: {
                "x-api-key": API_KEY,
            }
        })
    return res.json()
}