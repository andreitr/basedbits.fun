module.exports = {

    images: {
        domains: ['ipfs.raribleuserdata.com', 'res.cloudinary.com'],
    },

    headers: async () => {

        return [
            {
                source: '/api/images/(.*)',
                headers: [
                    {
                        key: "Cache-Control",
                        value: "max-age=1800",
                    },
                ],
            },
            {
                source: '/raffle/:id',
                headers: [
                    {
                        key: "Cache-Control",
                        value: "max-age=1800",
                    },
                ],
            },
            {
                source: '/users/[:address]',
                headers: [
                    {
                        key: "Cache-Control",
                        value: "max-age=1800",
                    },
                ],
            },
        ]
    },
}