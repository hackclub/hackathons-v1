module.exports = {
  siteMetadata: {
    siteUrl: 'https://hackathons.hackclub.com',
  },
  plugins: [
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        name: 'data',
        path: `${__dirname}/data/`,
      },
    },
    {
      resolve: 'gatsby-plugin-segment',
      options: {
        writeKey: 'enReVnqn2tVrMigdaSA5py2tRjSzlgHb',
      },
    },
    {
      resolve: 'gatsby-plugin-favicon',
      options: {
        logo: './static/icon.png',
        injectHTML: true,
        icons: {
          android: true,
          appleIcon: true,
          appleStartup: true,
          coast: false,
          favicons: true,
          firefox: true,
          twitter: false,
          yandex: false,
          windows: false,
        },
      },
    },
    {
      resolve: 'gatsby-plugin-canonical-urls',
      options: {
        siteUrl: 'https://hackathons.hackclub.com'
      }
    },
    'gatsby-plugin-sitemap',
    'gatsby-plugin-react-helmet',
    'gatsby-transformer-json',
    'gatsby-plugin-resolve-src',
    'gatsby-plugin-styled-components',
    'gatsby-transformer-sharp',
    'gatsby-plugin-sharp',
  ],
}
