const PayloadBuilder = require('./payload-builder');

class Contract {
    /**
     * A Wavelet smart contract execution simulator.
     *
     * @param {Wavelet} client Client instance which is connected to a single Wavelet node.
     * @param {string} contract_id Hex-encoded ID of a smart contract.
     */
    constructor(client, contract_id) {
        this.client = client;
        this.contract_id = contract_id;

        this.contract_payload = {
            round_idx: BigInt(0),
            round_id: "0000000000000000000000000000000000000000000000000000000000000000",
            transaction_id: "0000000000000000000000000000000000000000000000000000000000000000",
            sender_id: "0000000000000000000000000000000000000000000000000000000000000000",
            amount: BigInt(0),
            params: new Uint8Array(new ArrayBuffer(0)),
        };

        this.decoder = new TextDecoder();

        this.result = null;
        this.logs = [];

        this.rebuildContractPayload();
    }

    /**
     * Sets the consensus round index for all future simulated smart contract calls.
     *
     * @param {bigint} round_idx Consensus round index.
     */
    setRoundIndex(round_idx) {
        this.contract_payload.round_idx = round_idx;
    }

    /**
     * Sets the consensus round ID for all future simulated smart contract calls.
     *
     * @param {string} round_id A 64-letter hex-encoded consensus round ID.
     */
    setRoundID(round_id) {
        if (round_id.length !== 64) throw new Error("round id must be 64 letters and hex-encoded");
        this.contract_payload.round_id = round_id;
    }

    /**
     * Sets the ID of the transaction used to make all future simulated smart contract calls.
     *
     * @param {string} transaction_id A 64-letter ex-encoded transaction ID.
     */
    setTransactionID(transaction_id) {
        if (transaction_id.length !== 64) throw new Error("transaction id must be 64 letters and hex-encoded");
        this.contract_payload.transaction_id = transaction_id;
    }

    /**
     * Sets the sender ID for all future simulated smart contract calls.
     *
     * @param {string} sender_id A 64-letter hex-encoded sender wallet address ID.
     */
    setSenderID(sender_id) {
        if (sender_id.length !== 64) throw new Error("sender id must be 64 letters and hex-encoded");
        this.contract_payload.sender_id = sender_id;
    }

    /**
     * Simulates a call to the smart contract. init() must be called to initialize the WebAssembly VM
     * before calls may be performed against this specified smart contract.
     *
     * @param {string} func_name Name of the smart contract function to call.
     * @param {bigint} amount_to_send Amount of PERLs to send simultaneously to the smart contract
     *  while calling a function.
     * @param {...{type: ('int16'|'int32'|'int64'|'uint16'|'uint32'|'uint64'|'byte'|'raw'|'bytes'|'string'), value: number|string|ArrayBuffer|Uint8Array}} func_params Variadic list of arguments.
     * @returns {{result: string|undefined, logs: Array<string>}}
     */
    test(wallet, func_name, amount_to_send, ...func_params) {
        if (this.vm === undefined) throw new Error("init() needs to be called before calling test()");

        func_name = "_contract_" + func_name;

        if (!(func_name in this.vm.instance.exports)) {
            throw new Error("could not find function in smart contract");
        }

        this.contract_payload.params = this.parseFunctionParams(...func_params);
        this.contract_payload.amount = amount_to_send;
        this.contract_payload.sender_id = Buffer.from(wallet.publicKey).toString("hex");
        this.rebuildContractPayload();

        // Clone the current browser VM's memory.
        const copy = ArrayBuffer.transfer(this.vm.instance.exports.memory.buffer, this.vm.instance.exports.memory.buffer.byteLength);

        // Call the function.
        this.vm.instance.exports[func_name]();

        // Collect simulated execution results.
        const res = {result: this.result, logs: this.logs};

        // Reset the browser VM.
        new Uint8Array(this.vm.instance.exports.memory.buffer, 0, copy.byteLength).set(copy);

        // Reset all func_params and results and logs.
        this.contract_payload.params = new Uint8Array(new ArrayBuffer(0));
        this.result = null;
        this.logs = [];

        return res;
    }


    /**
     * Parses smart contract function parameters as a variadic list of arguments, and translates
     * them into an array of bytes suitable for passing on to a single smart contract invocation call.
     *
     * @param {...{type: ('int16'|'int32'|'int64'|'uint16'|'uint32'|'uint64'|'byte'|'raw'|'bytes'|'string'), value: number|string|ArrayBuffer|Uint8Array}} params Variadic list of arguments.
     * @returns {Uint8Array} Parameters serialized into bytes.
     */
    parseFunctionParams(...params) {
        const builder = new PayloadBuilder();

        params.forEach(param => {
            switch (param.type) {
                case "int16":
                    builder.writeInt16(param.value);
                    break;
                case "int32":
                    builder.writeInt32(param.value);
                    break;
                case "int64":
                    builder.writeInt64(param.value);
                case "uint16":
                    builder.writeUint16(param.value);
                    break;
                case "uint32":
                    builder.writeUint32(param.value);
                    break;
                case "uint64":
                    builder.writeUint64(param.value);
                    break;
                case "byte":
                    builder.writeByte(param.value);
                    break;
                case "raw":
                    if (typeof param.value === "string") { // Assume that it is hex-encoded.
                        param.value = new Uint8Array(param.value.match(/[\da-f]{2}/gi).map(h => parseInt(h, 16)));
                    }

                    builder.writeBytes(param.value);
                    break;
                case "bytes":
                    if (typeof param.value === "string") { // Assume that it is hex-encoded.
                        param.value = new Uint8Array(param.value.match(/[\da-f]{2}/gi).map(h => parseInt(h, 16)));
                    }

                    builder.writeUint32(param.value.byteLength);
                    builder.writeBytes(param.value);
                    break;
                case "string":
                    builder.writeBytes(Buffer.from(param.value, 'utf8'));
                    builder.writeByte(0);
                    break;
            }
        });

        return builder.getBytes();
    }

    /**
     * Based on updates to simulation settings for this smart contract, re-build the
     * smart contracts payload.
     */
    rebuildContractPayload() {
        const builder = new PayloadBuilder();
        builder.writeUint64(this.contract_payload.round_idx);
        builder.writeBytes(Buffer.from(this.contract_payload.round_id, "hex"));
        builder.writeBytes(Buffer.from(this.contract_payload.transaction_id, "hex"));
        builder.writeBytes(Buffer.from(this.contract_payload.sender_id, "hex"));
        builder.writeUint64(this.contract_payload.amount);
        builder.writeBytes(this.contract_payload.params);

        this.contract_payload_buf = builder.getBytes();
    }

    /**
     * Fetches and re-loads the memory of the backing WebAssembly VM for this smart contract; optionally
     * growing the number of memory pages associated to the VM should there be not enough memory to hold
     * any new updates to the smart contracts memory. init() must be called before this function may be
     * called.
     *
     * @returns {Promise<void>}
     */
    async fetchAndPopulateMemoryPages() {
        if (this.vm === undefined) throw new Error("init() needs to be called before calling fetchAndPopulateMemoryPages()");

        const account = await this.client.getAccount(this.contract_id);
        const loaded_memory = await this.client.getMemoryPages(account.public_key, account.num_mem_pages);

        const num_mem_pages = this.vm.instance.exports.memory.buffer.byteLength / 65536;
        const num_loaded_mem_pages = loaded_memory.byteLength / 65536;
        if (num_mem_pages < num_loaded_mem_pages) {
            this.vm.instance.exports.memory.grow(num_loaded_mem_pages - num_mem_pages);
        }

        new Uint8Array(this.vm.instance.exports.memory.buffer, 0, loaded_memory.byteLength).set(loaded_memory);
    }

    /**
     * Downloads smart contract code from the Wavelet node if available, and initializes
     * a WebAssembly VM to simulate function calls against the contract.
     *
     * @returns {Promise<void>}
     */
    async init() {
        this.code = await this.client.getCode(this.contract_id);

        const imports = {
            env: {
                abort: () => {
                },
                _send_transaction: (tag, payload_ptr, payload_len) => {
                    const payload_view = new Uint8Array(this.vm.instance.exports.memory.buffer, payload_ptr, payload_len);
                    const payload = this.decoder.decode(payload_view);
                    console.log(`Sent transaction with tag ${tag} and payload ${params}.`);
                },
                _payload_len: () => {
                    return this.contract_payload_buf.byteLength;
                },
                _payload: payload_ptr => {
                    const view = new Uint8Array(this.vm.instance.exports.memory.buffer, payload_ptr, this.contract_payload_buf.byteLength);
                    view.set(this.contract_payload_buf);
                },
                _result: (ptr, len) => {
                    this.result = this.decoder.decode(new Uint8Array(this.vm.instance.exports.memory.buffer, ptr, len));
                },
                _log: (ptr, len) => {
                    const view = new Uint8Array(this.vm.instance.exports.memory.buffer, ptr, len);
                    this.logs.push(this.decoder.decode(view));
                },
                _verify_ed25519: () => {
                },
                _hash_blake2b_256: () => {
                },
                _hash_sha256: () => {
                },
                _hash_sha512: () => {
                },
            }
        };

        this.vm = await WebAssembly.instantiate(this.code, imports);
        await this.fetchAndPopulateMemoryPages();
    }
}


module.exports = Contract;