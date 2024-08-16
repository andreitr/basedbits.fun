/** @type {import('next').NextConfig} */
const nextConfig = {

    async headers() {
        return [
            {
                source: '/api/images/raffle`',
                headers: [
                    {
                        key: "Cache-Control",
                        value: "public, max-age=3600",
                    },
                ],
            },
            {
                source: '/api/images/user`',
                headers: [
                    {
                        key: "Cache-Control",
                        value: "public, max-age=3600",
                    },
                ],
            },
            {
                source: '/raffle/:id',
                headers: [
                    {
                        key: "Cache-Control",
                        value: "public, max-age=3600",
                    },
                ],
            },
        ]
    },

    images: {
        domains: ['ipfs.raribleuserdata.com', 'res.cloudinary.com'],
    },
};


export default nextConfig;
