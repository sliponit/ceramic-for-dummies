# ceramic demo app

## motivation
This project is a demo app for querying ceramic network without connecting a wallet. It shows how to compute determistically and offline the stream ID from the ETH address and how to use this stream ID to query ceramic network API. It restricts to 'kovan' testnet and 'basic profile' definition for the steam type 'tile' of ceramic but these can be extended. It is heavily inspired by https://blog.ceramic.network/getting-started-with-ceramic/ without any need from Metamask or Sign In with Ethereum 


The point here is not to use any web3 / ceramic specific library to query a profile from an ETH adress. This function 'fetchProfile' computes offline the stream ID from ETH adress - see 'computeStreamId' and then fetches 2 times the ceramic network API - first for the definition ID and then the profile. Hashing functions/libraries are used for computeStreamId, these are the only imports. This function 'computeStreamId' shall be useful in itself, it could not be found except from patching together various ceramic libraries. Other parts of the code are similar to the initial tutorial, no frontend framework. This is just a minimal code to better understand how to query ceramic network.

## run
Convert `main.js` with webpack
```bash
npm run build
```

No frontend framework, run with a tool like https://www.npmjs.com/package/static-server or visual extension https://visualstudio.microsoft.com/services/live-share/