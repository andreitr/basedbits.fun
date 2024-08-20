/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['ipfs.raribleuserdata.com', 'res.cloudinary.com'],
    },

    async headers() {
        return [
            {
                source: "/api/images/(.*)",
                headers: [
                    {
                        key: "Cache-Control",
                        value: "max-age=1800",
                    },
                ],
            },
            {
                source: "/raffle/(.*)",
                headers: [
                    {
                        key: "Cache-Control",
                        value: "max-age=1800",
                    },
                ],
            },
            {
                source: "/users/(.*)",
                headers: [
                    {
                        key: "Cache-Control",
                        value: "max-age=1800",
                    },
                ],
            },
        ]
    }
};

export default nextConfig;
