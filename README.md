# Wavelet Reveal - Decentralized Blog
![enter image description here](https://cdn-images-1.medium.com/max/1600/1*2SPmQZdeeVg88hcGUl1NlQ.png)

This simple distributed blog with a one-click paywall. It runs on [Wavelet](https://github.com/perlin-network/wavelet) network and is build using [Gatsby](https://github.com/gatsbyjs/gatsby).

Anyone can publish a Post which involves paying a fee to the Blog owner (account responsible for deploying the Smart Contract). To recover and get a profit, Publishers can add a fee for anyone to be able to see their content.

## Folders
* **contract** - contains rust smart contract 
* **client** - it's a Gatsby default starter project

## Development

### Rust Smart Contract
From the **contract**  folder:
* run `cargo build --release --target wasm32-unknown-unknown`  to compile the smart contract
* you can upload your smart-contract on the Wavelet testnet via [https://lens.perlin.net/#/contracts](https://lens.perlin.net/#/contracts)

### Gatsby Client
From the **client** folder:
* run `gatsby develop` or `npm run develop` to run Gatsby development server
* run `gatsby build` or `npm run build` to build the project for production
* run `gatsby serve` or `npm run serve` to start static server view the built app