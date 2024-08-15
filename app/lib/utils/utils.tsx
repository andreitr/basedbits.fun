export const rootURI = () => {
    return process.env.VERCEL_URL
        ? `https://basedbits.fun`
        : "http://localhost:3000";
};
