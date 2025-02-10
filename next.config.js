module.exports = {

    images: {
        domains: ['ipfs.raribleuserdata.com', 'res.cloudinary.com', 'cloudflare-eth.com'],
    },

    headers: async () => {

        return [
            {
                source: '/raffle/:id',
                headers: [
                    {
                        key: "cache-control",
                        value: "public, immutable, no-transform, max-age=600",
                    },
                ],
            },
            {
                source: '/users/[:address]',
                headers: [
                    {
                        key: "cache-control",
                        value: "public, immutable, no-transform, max-age=600",
                    },
                ],
            },
            {
                source: '/here',
                headers: [
                    {
                        key: "cache-control",
                        value: "public, immutable, no-transform, max-age=600",
                    },
                ],
            },
        ]
    },
}