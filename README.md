WalletChat is a web app, Widget and browser extension that makes communication easy in web3!

### Features
- Chat with any wallet address
- Include NFT context into chat for trading
- View comments about an NFT

## Screenshots

![alt text](https://github.com/manapixels/walletchat/blob/main/src/images/screenshots/Browser%20Extension%20-%20Inbox%20-%20All.png?raw=true)

![alt text](https://github.com/manapixels/walletchat/blob/main/src/images/screenshots/Browser%20Extension%20-%20NFT%20Page%20-%20Comments.png?raw=true)

## To get it running

### Front-end (this repo)

### `npm run build`

Builds the app for production to the `build` folder.<br />
Go to 'Manage Extensions' in Chrome > Load unpacked > select the 'build' folder.<br />
The extension should now be installed.

### Back-end

[https://github.com/cryptoKevinL/restWalletChat](https://github.com/cryptoKevinL/restWalletChat)

The back-end consists of the IPFS, a centralized database and REST API for interacting with the front-end. We use a server for speed so as to improve user experience, with the decentralized IPFS for storing and pinning messages that can be retrieved by users. Messages are protected by a decentralized encryption method.
