const fetch = require("node-fetch");
const queryString = require("query-string");
const Contract = require('./src/contract');
const Wavelet = require('./src/wavelet')
const JSBI = require('jsbi');
const nacl = require('tweetnacl');

const BigInt = JSBI.BigInt;


exports.sourceNodes = (
    { actions, createNodeId, createContentDigest },
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
        // const nodeId = createNodeId(`reveal-post-${post.id}`);
        const nodeContent = JSON.stringify(post);
        const nodeData = Object.assign({}, post, {
            // id: nodeId,
            parent: null,
            children: [],
            internal: {
                type: `RevealPost`,
                content: nodeContent,
                contentDigest: createContentDigest(post),
            },
        })
        return nodeData;
    }

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
            // Use Gatsby's createNode helper to create a node from the node data
            createNode(nodeData);
        });
    });
}