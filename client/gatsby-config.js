require("dotenv").config({
  path: `.env`,
});


module.exports = {
  siteMetadata: {
    title: `Gatsby Default Starter`,
    description: `Kick off your next, great Gatsby project with this default starter. This barebones starter ships with the main Gatsby configuration files you might need.`,
    author: `@gatsbyjs`,
  },
  plugins: [
    `gatsby-plugin-sass`,
    
    `gatsby-plugin-react-helmet`,
    {
      resolve: `gatsby-plugin-styled-components`,
      options: {
        displayName: true
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `images`,
        path: `${__dirname}/src/images`,
      },
    },
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `gatsby-starter-default`,
        short_name: `starter`,
        start_url: `/`,
        background_color: `#663399`,
        theme_color: `#663399`,
        display: `minimal-ui`,
        icon: `src/images/gatsby-icon.png`, // This path is relative to the root of the site.
      },
    },
    
    {
      resolve: "gatsby-source-reveal",
      options: {
        api_host: process.env.WAVELET_API_URL || 'https://testnet.perlin.net',
          contract_id: 'e78898479903bcc0ec696269fe3df0aee02b46a303d42f6133017fe3b2fc5786' // process.env.CONTRACT_ID ||
      },
    },
    {
      resolve: `gatsby-plugin-env-variables`,
      options: {
        whitelist: ["WAVELET_API_URL", "CONTRACT_ID"]
      },
    },
    {
      resolve: `gatsby-plugin-layout`,
      options: {
          component: require.resolve(`./src/components/layout.js`)
      }
  }
    // this (optional) plugin enables Progressive Web App + Offline functionality
    // To learn more, visit: https://gatsby.dev/offline
    // `gatsby-plugin-offline`,
  ],
}
