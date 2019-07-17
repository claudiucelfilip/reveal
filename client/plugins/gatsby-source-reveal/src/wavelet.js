const axios = require('axios');
const nacl = require('tweetnacl');

class Wavelet {

    constructor(host) {
        this.host = host;
    }
    /**
   * Query for details of an account; whether it be a smart contract or a user.
   *
   * @param {string} id Hex-encoded account/smart contract address.
   * @param {Object=} opts Options to be passed on for making the specified HTTP request call (optional).
   * @returns {Promise<{public_key: string, nonce: bigint, balance: bigint, stake: bigint, reward: bigint, is_contract: boolean, num_mem_pages: bigint}>}
   */
    async getAccount(id, opts = {}) {
        return (await axios.get(`${this.host}/accounts/${id}`, { ...this.opts, ...opts })).data;
    }

    /**
    * Query for the amalgamated WebAssembly VM memory of a given smart contract.
    *
    * @param {string} id Hex-encoded ID of the smart contract.
    * @param {number} num_mem_pages Number of memory pages the smart contract has.
    * @param {Object=} opts  Options to be passed on for making the specified HTTP request call (optional).
    * @returns {Promise<Uint8Array>} The memory of the given smart contract, which may be used to
    *  initialize a WebAssembly VM with (either on browser/desktop).
    */
    async getMemoryPages(id, num_mem_pages, opts = {}) {
        if (num_mem_pages === 0) throw new Error("num pages cannot be zero");

        const memory = new Uint8Array(new ArrayBuffer(65536 * num_mem_pages));
        const reqs = [];

        for (let idx = 0; idx < num_mem_pages; idx++) {
            reqs.push((async () => {
                try {
                    const res = await axios.get(`${this.host}/contract/${id}/page/${idx}`, {
                        ...this.opts, ...opts,
                        responseType: 'arraybuffer',
                        responseEncoding: 'binary'
                    });

                    if (res.status === 200) {
                        const page = new Uint8Array(res.data);
                        memory.set(page, 65536 * idx);
                    }
                } catch (error) {
                }
            })());
        }

        await Promise.all(reqs);

        return memory;
    }

    /**
    * Query for the raw WebAssembly code of a smart contract.
    *
    * @param string} id Hex-encoded ID of the smart contract.
    * @param {Object=} opts  Options to be passed on for making the specified HTTP request call (optional).
    * @returns {Promise<Uint8Array>}
    */
    async getCode(id, opts = {}) {
        return new Uint8Array((await axios.get(`${this.host}/contract/${id}`, {
            ...this.opts, ...opts,
            responseType: 'arraybuffer',
            responseEncoding: 'binary'
        })).data);
    }


    /**
    * Load a Wavelet wallet given a hex-encoded private key.
    *
    * @param {string} private_key_hex Hex-encoded private key.
    * @returns {nacl.SignKeyPair} Wavelet wallet.
    */
    static loadWalletFromPrivateKey(private_key_hex) {
        return nacl.sign.keyPair.fromSecretKey(Buffer.from(private_key_hex, "hex"));
    }

}

module.exports = Wavelet; 