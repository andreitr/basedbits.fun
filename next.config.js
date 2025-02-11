module.exports = {

    images: {
        remotePatterns: [
            {protocol: 'https', hostname: 'ipfs.raribleuserdata.com'},
            {protocol: 'https', hostname: 'res.cloudinary.com'},
        ],
    },

    headers: async () => {

        return [
            // {
            //     source: '/users/[:address]',
            //     headers: [
            //         {
            //             key: "cache-control",
            //             value: "public, immutable, no-transform, max-age=600",
            //         },
            //     ],
            // },
        ]
    },
}