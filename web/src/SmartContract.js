import { Wavelet, Contract, TAG_TRANSFER } from 'wavelet-client';
import JSBI from 'jsbi';
const BigInt = JSBI.BigInt;

const GAS_LIMIT = 1000000;
const POST_CREATE_COST = 1000;

class SmartContract {
    static getInstance() {
        if (SmartContract.singleton === undefined) {
            SmartContract.singleton = new SmartContract();
        }
        return SmartContract.singleton;
    }

    constructor() {
        this.client = new Wavelet('http://127.0.0.1:9000');
        const privateKey = localStorage.getItem('privateKey');
        if (privateKey) {
            this.wallet = Wavelet.loadWalletFromPrivateKey(privateKey);
        }
        
    }

    listenForApplied = (tag, txId) => {
        return new Promise(async (resolve, reject) => {
            const poll = await this.client.pollTransactions(
                {
                    onTransactionApplied: (data) => {
                        const tx = {
                            id: data.tx_id,
                            sender: data.sender_id,
                            creator: data.creator_id,
                            depth: data.depth,
                            tag: data.tag,
                            status: data.event || "new"
                        };
                        resolve(tx);
                        poll.close();
                    },
                    onTransactionRejected: (data) => {
                        const message =
                            data.error || `Transaction was rejected`;
                        reject(new Error(message));
                        poll.close();
                    }
                },
                { tag, id: txId }
            );
        });
    }

    async init() {
        this.contract = new Contract(this.client, '52646dc9cf7fd2fa155caf41fca9f911306cee864fdd47e1f7e10afffb34747a');
        return await this.contract.init();
    }

    savePrivateKey(key) {
        localStorage.setItem('privateKey', key);
    }

    removePrivateKey() {
        localStorage.setItem('privateKey', '');
        this.wallet = null;
        this.client = null;
        this.contract = null;
    }

    parseResponse(response) {
        const { logs } = response;
        const data = JSON.parse(logs[0]);
        console.log(data);
        return data;
    }

    reloadMemory = async (data) => {
        await this.contract.fetchAndPopulateMemoryPages();
        return data;
    }

    async getPosts() {
        const response = this.contract.test(
            this.wallet,
            'get_posts',
            BigInt(0)
        );

        return this.parseResponse(response);
    }

    async getPost(id) {
        const response = this.contract.test(
            this.wallet,
            'get_post_details',
            BigInt(0),
            {
                type: "string",
                value: id
            }
        )

        return this.parseResponse(response);
    }

    async payPost(id, price) {
        const response = await this.contract.call(
            this.wallet,
            'add_private_viewer',
            BigInt(price),
            BigInt(GAS_LIMIT),
            {
                type: "string",
                value: id
            }
        );

        return await this.listenForApplied(
            TAG_TRANSFER,
            response.id
        ).then(this.reloadMemory);
    }

    async cashOut() {
        const response = await this.contract.call(
            this.wallet,
            'cash_out',
            BigInt(0),
            BigInt(GAS_LIMIT)
        );

        return await this.listenForApplied(
            TAG_TRANSFER,
            response.id
        ).then(this.reloadMemory);
    }

    async createPost(data) {
        const response = await this.contract.call(
            this.wallet,
            'create_post',
            BigInt(POST_CREATE_COST),
            BigInt(GAS_LIMIT),
            {
                type: "string",
                value: data.title
            },
            {
                type: "string",
                value: data.publicText
            },
            {
                type: "string",
                value: data.privateText
            }, {
                type: "uint64",
                value: JSBI.BigInt(data.price)
            }, {
                type: "uint32",
                value: Date.now()
            }
        );

        return await this.listenForApplied(
            TAG_TRANSFER,
            response.id
        ).then(this.reloadMemory);
    }

    async votePost(id, upVote) {
        const response = await this.contract.call(
            this.wallet,
            'vote_post',
            BigInt(0),
            BigInt(GAS_LIMIT),
            {
                type: 'string',
                value: id
            },
            {
                type: 'byte',
                value: upVote ? 1 : 0
            }
        );

        return await this.listenForApplied(
            TAG_TRANSFER,
            response.id
        ).then(this.reloadMemory);
    }
}

export default SmartContract;