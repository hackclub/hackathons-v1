module.exports = {
  siteMetadata: {
    siteUrl: 'https://hackathons.hackclub.com',
  },
  plugins: [
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        name: 'data',
        path: `${__dirname}/data/stats.json`,
      },
    },
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        name: 'events',
        path: `${__dirname}/data/events.json`,
      },
    },
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        name: 'groups',
        path: `${__dirname}/data/groups.json`,
      },
    },
    {
      resolve: 'gatsby-plugin-segment-js',
      options: {
        prodKey: 'enReVnqn2tVrMigdaSA5py2tRjSzlgHb',
        trackPage: true,
      },
    },
    {
      resolve: 'gatsby-plugin-html-attributes',
      options: {
        lang: 'en',
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
