import React from 'react';
import logo from './logo.svg';
import './App.css';
import { Wavelet, Contract, TAG_TRANSFER } from 'wavelet-client';
import JSBI from 'jsbi';

const BigInt = JSBI.BigInt;

function listenForApplied(client, tag, txId) {
  return new Promise(async (resolve, reject) => {
      const poll = await client.pollTransactions(
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

const client = new Wavelet('http://127.0.0.1:9000');

(async () => {
  const wallet = Wavelet.loadWalletFromPrivateKey('87a6813c3b4cf534b6ae82db9b1409fa7dbd5c13dba5858970b56084c4a930eb400056ee68a7cc2695222df05ea76875bc27ec6e61e8e62317c336157019c405');
  const account = await client.getAccount(Buffer.from(wallet.publicKey).toString("hex"));
  console.log(account);


  const contract = new Contract(client, '8b9abcc4d7662fdc74f989750bbd9f19a3af1f611eed2d1d56e55c452153a6f7');
  await contract.init();

  // await contract.call(
  //   wallet,
  //   'create_post',
  //   BigInt(33),
  //   JSBI.subtract(BigInt(account.balance), BigInt(1000)),
  // )


  // await contract.test(
  //   'create_post',
  //   BigInt(33),
  // )
 
  const test = await contract.test(
    'create_post',
    BigInt(40),
    {
      type: "string",
      value: "title 2"
    },
    {
      type: "string",
      value: "public_text 2"
    },
    {
      type: "string",
      value: "private_text 2"
    }, {
      type: "uint64",
      value: JSBI.BigInt(12)
    }, {
      type: "uint32",
      value: Date.now()
    }
  );

  console.log("test", test);


  const tx = await contract.call(
    wallet,
    'create_post',
    BigInt(40),
    JSBI.subtract(BigInt(account.balance), BigInt(1000000)),
    {
      type: "string",
      value: "title 2"
    },
    {
      type: "string",
      value: "public_text 2"
    },
    {
      type: "string",
      value: "private_text 2"
    }, {
      type: "uint64",
      value: JSBI.BigInt(12)
    }, {
      type: "uint32",
      value: Date.now()
    }
  );

  // console.log(tx);
  // await listenForApplied(client, TAG_TRANSFER, tx.id);
  
  // // await contract.fetchAndPopulateMemoryPages();

  const response = await contract.test(
    'get_posts', 
    BigInt(20)
  );
  
  console.log(response);

  const {logs} = response;
  const posts = JSON.parse(logs[0]);
  
  console.log(posts);

})();

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
