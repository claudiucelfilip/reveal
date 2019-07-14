import { Wavelet, Contract, TAG_TRANSFER } from '@claudiucelfilip/wavelet-client';
import { createContext } from 'react';
import { decorate, observable } from 'mobx';
import JSBI from 'jsbi';
const BigInt = JSBI.BigInt;

const GAS_LIMIT = 1000000;
const POST_CREATE_COST = 1000000;

class SmartContract {
    constructor() {
        this.client = new Wavelet('http://127.0.0.1:9000');
    }

    async pollAccountUpdates(
        id
    ) {
        return await this.client.pollAccounts(
            {
                onAccountUpdated: (data) => {
                    if (data.event === 'balance_updated') {
                        this.account.balance = data.balance.toString();
                    }
                }
            },
            { id }
        );
    }
    get privateKey() {
        return localStorage.getItem('privateKey');
    }
    set privateKey(value) {
        localStorage.setItem('privateKey', value);
    }
    get contractId() {
        return localStorage.getItem('contractId');
    }
    set contractId(value) {
        localStorage.setItem('contractId', value);
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
        if (!this.contractId || !this.privateKey) {
            throw Error('Missing contractID or privateKey');
        }

        await this.login();
        this.contract = new Contract(this.client, this.contractId);
        await this.contract.init();
    }

    updatedKeys(privateKey, contractId) {
        this.privateKey = privateKey;
        this.contractId = contractId;
    }

    hasKeys() {
        return !!this.privateKey && !!this.contractId;
    }

    async login() {
        this.wallet = Wavelet.loadWalletFromPrivateKey(this.privateKey);
        const account = await this.client.getAccount(Buffer.from(this.wallet.publicKey).toString("hex"));
        this.account = account;
        
        this.accountPoll = await this.pollAccountUpdates(account.public_key);
        return true;
    }

    logout() {
        this.wallet = null;
        this.contract = null;
        this.updatedKeys('', '');
        if (this.accountPoll) {
            this.accountPoll.close();
        }
        
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
                value: data.excerpt
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

decorate(SmartContract, {
    account: observable
});

export default createContext(new SmartContract());