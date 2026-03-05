/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "images.unsplash.com",
      "upload.wikimedia.org",
      "cdn.pixabay.com",
      "res.cloudinary.com",
      "your-s3-bucket.s3.amazonaws.com",
      "lh3.googleusercontent.com",
      "media.istockphoto.com",
      "i.imgur.com",
    ],
  },

  async redirects() {
    return [
      {
        source: "/booking",
        destination: "/dashboard",
        permanent: true,
      },
      {
        source: "/bookings",
        destination: "/dashboard",
        permanent: true,
      },
    ];
  },

  // Allow cookies to be shared across subdomains in production.
  // This is handled at the cookie Set-Cookie level in your API routes,
  // no extra Next.js config needed here.
};

module.exports = nextConfig;
