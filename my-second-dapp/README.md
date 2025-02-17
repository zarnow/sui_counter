## Starting your dApp

Before executing add counter package to :
export const TESTNET_COUNTER_PACKAGE_ID = "0x8bf892986a2508763d49a1ce1bf26cceab7a34e3d5d8ef2b5ebb3ff017ec8760" in file:
src\constants.ts

locker package id: 0x341979ec4c2beaffd5b45d3a2cae11807dc6b459ef36a3fabcf86355ba43d3d4
``` bash
npm install --save @mysten/dapp-kit @mysten/sui @tanstack/react-query
pnpm install
pnpm add react-spinners
pnpm add react-toastify
# deprecated: pnpm install @mysten/sui.js
pnpm dev
```

## notes: 
``` bash
sui move build --skip-fetch-latest-git-deps
sui client publish --skip-fetch-latest-git-deps
http://localhost:5173/#0x91efc86fda2d7f297d0e48d5de52652c283ae006349863eed051f62b989fff0b
```