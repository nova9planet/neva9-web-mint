const withImages = require('next-images')
module.exports = withImages({
  webpack(config, options) {
    return config
  },
  images: {
    loader: 'default', //'cloudinary',
    domains: ['*'],
  },

  poweredByHeader: process.env.NODE_ENV === 'development',
  reactStrictMode: process.env.NODE_ENV === 'development',
})
