const path = require('path');

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

const wrapper = promise =>
  promise.then(result => {
    if (result.errors) {
      throw result.errors
    }
    return result
  })

// You can delete this file if you're not using it
exports.createPages = async ({ actions, graphql }) => {
  const { createPage } = actions;
  let allRevealPost = [];
  try {
    result = await wrapper(graphql(`
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
                public_text
                excerpt
                created_at
              }
            }
        }
    }  
  `));
    allRevealPost = result.data.allRevealPost.edges;
  } catch (err) {
    console.warn(err);
  }

  createPage({
    path: '/',
    component: require.resolve('./src/templates/index.js'),
    context: { allRevealPost },
  });

  const blogTemplate = path.resolve('./src/templates/details.js');

  createPage({
    path: '/0',
    component: blogTemplate,
    context: { 
      slug: '0',
      revealPost: {}
     }
  });

  allRevealPost.forEach(({ node }) => {
    createPage({
      path: node.id,
      component: blogTemplate,
      context: {
        slug: node.id,
        revealPost: node
      } // additional data can be passed via context
    });
  });
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
      target: 'node',
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
