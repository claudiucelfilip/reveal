const { Contract, Wavelet } = require('wavelet-client');
const JSBI = require('jsbi');
const nacl = require('tweetnacl');

const BigInt = JSBI.BigInt;

exports.createSchemaCustomization = ({ actions }) => {
    const { createTypes } = actions
    const typeDefs = `
      type RevealPost implements Node {
        title: String,
        owner: String,
        rating: Int,
        score: Float,
        tags: String,
        public_text: String,
        excerpt: String,
        created_at: Int
      }
    `;
    createTypes(typeDefs);
};

exports.sourceNodes = (
    { actions, createContentDigest },
    configOptions
) => {
    const { createNode } = actions;

    const { api_host, contract_id } = configOptions;
    delete configOptions.plugins;


    const parseResponse = (response) => {
        const { logs } = response;
        const data = JSON.parse(logs[0]);
        return data;
    };

    const processPost = post => {
        const nodeContent = JSON.stringify(post);
        const nodeData = Object.assign({}, post, {
            parent: null,
            children: [],
            internal: {
                type: `RevealPost`,
                content: nodeContent,
                contentDigest: createContentDigest(post),
            },
        })
        return nodeData;
    };

    const client = new Wavelet(api_host);
    const generatedKeys = nacl.sign.keyPair();
    const secretKey = Buffer.from(generatedKeys.secretKey).toString("hex");
    const wallet = Wavelet.loadWalletFromPrivateKey(secretKey);
    const contract = new Contract(client, contract_id);

    return contract.init().then(() => {
        const response = contract.test(
            wallet,
            'get_posts',
            BigInt(0),
            {
                type: 'uint32',
                value: Math.floor(new Date() / 1000)
            }
        );

        parseResponse(response).forEach(post => {
            const nodeData = processPost(post);
            createNode(nodeData);
        });
    });
}