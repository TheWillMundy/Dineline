/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/node-apis/
 */
const { createFilePath } = require(`gatsby-source-filesystem`)
const path = require(`path`)

// You can delete this file if you're not using it
exports.onCreateNode = ({ node, getNode, actions }) => {
    const { createNodeField } = actions

    const slugify = (name) => {
        let newName = name.toLowerCase().replace(/ /g, "-");
        let randomInt = Array.from(Array(5)).map(elem => Math.floor(Math.random() * 9 + 1)).join("");
        return newName + "-" + String(randomInt);
    }

    if (node.internal.type == 'square__catalog' && node.type == 'ITEM') {
        
        // This goes on the general menu
        // Filename will be its item_data name
        const slug = slugify(node.item_data.name);
        // const slug = createFilePath({ node, getNode, basePath: `items` })
        createNodeField({
            node,
            name: `slug`,
            value: slug,
        });
        // console.log(node);
    }
}

exports.createPages = async ({ graphql, actions }) => {
    const { createPage } = actions

    // **Note:** The graphql function call returns a Promise
    // see: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise for more info
    const result = await graphql(`
    query {
        allSquareCatalog(filter:{type:{eq:"ITEM"}}) {
            edges {
                node {
                    fields {
                        slug
                    }
                }
            }
        }
    }
    `)

    // Now create the page
    result.data.allSquareCatalog.edges.forEach(({ node }) => {
        createPage({
            path: node.fields.slug,
            component: path.resolve(`./src/templates/product-detail.js`),
            context: {
                slug: node.fields.slug
            }
        })
    });
  }