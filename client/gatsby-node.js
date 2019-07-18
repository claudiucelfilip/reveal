const path = require('path');
const { createFilePath, createFileNode } = require(`gatsby-source-filesystem`)

/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/node-apis/
 */

exports.onCreatePage = async ({ page, actions }) => {
    const { createPage } = actions;
  
    // page.matchPath is a special key that's used for matching pages
    // only on the client.
    if (page.path.match(/^\/app/)) {
      page.matchPath = `/app/*`;
  
      // Update the page.
      createPage(page);
  };
};
  
// You can delete this file if you're not using it
exports.createPages = ({ actions, graphql }) => {
    const { createPage } = actions;

    return new Promise((resolve, reject) => {

        resolve(graphql(`
    {
        allRevealPost {
            edges {
              node {
                id
                owner
                rating
                score
                tags
                title
                excerpt
                created_at
              }
            }
        }
    }
  `).then(result => {
            if (result.errors) {
                console.log(result.errors)
                return reject(result.errors)
            }

            const blogTemplate = path.resolve('./src/templates/details.js');

            result.data.allRevealPost.edges.forEach(({ node }) => {
                createPage({
                    path: node.id,
                    component: blogTemplate,
                    context: {
                        slug: node.id,
                    }, // additional data can be passed via context
                })
            })
            return
        })
        )
    })
}

exports.onCreateNode = ({ node, getNode, actions }) => {
    const { createNodeField } = actions
    if (node.internal.type === `RevealPost`) {
        const slug = node.id;
        createNodeField({
            node,
            name: `slug`,
            value: slug,
        })
    }
}

exports.onCreateWebpackConfig = ({ stage, loaders, actions }) => {
    if (stage === "build-html") {
      actions.setWebpackConfig({
        target : 'node',
        module: {
          rules: [
            {
              test: /quill/,
              use: loaders.null(),
            },
          ],
        },
      })
    }
  }
  