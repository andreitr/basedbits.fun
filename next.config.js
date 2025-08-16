module.exports = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "storage.googleapis.com",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "cdn.charmverse.io",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "imagedelivery.net",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "warpcast.com",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "i.imgur.com",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "cloudflare-eth.com",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "ipfs.raribleuserdata.com",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "res.cloudinary.com",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "basepaint.xyz",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "basedbits.mypinata.cloud",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "alchemy.mypinata.cloud",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "gateway.pinata.cloud",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "ipfs.io",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "*.alchemy.com",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "*.alchemyapi.io",
                pathname: "/**",
            },
        ],
    },
    async headers() {
        return [
            {
                source: '/api/:path*',
                headers: [
                    { key: 'Access-Control-Allow-Origin', value: '*' },
                    { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
                    { key: 'Access-Control-Allow-Headers', value: '*' },
                    { key: 'Access-Control-Allow-Credentials', value: 'true' },
                ],
            },
            {
                source: '/(.*)',
                headers: [
                    { 
                        key: 'Content-Security-Policy', 
                        value: "default-src 'self' https:; script-src 'self' 'unsafe-eval' 'unsafe-inline' https:; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: https: *; connect-src 'self' https: wss: *; font-src 'self' data: https:; object-src 'none'; base-uri 'self'; form-action 'self';"
                    },
                ],
            },
        ];
    },
}