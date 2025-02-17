# sui_counter
basic counter demo

# publish 
sui move build --skip-fetch-latest-git-deps
sui client publish --skip-fetch-latest-git-deps
published PackageID: 0x1820092cf24d4fdac9b45e21e056c36608e1e327c14112f07e5f6a1989a829dc
Modules: sui_counter

refreshed package: 0x297e1de3b5f7e1eda1d9a8b97516704c07fbedfe54352c8719fa855eed7a3585
locker package: 0x3380c17ebbb5dac9915fdce0d60cc2d69c9cb143187a11e612ee50ad299cf048
# run 
cd c:\Tools\ts-sdks\packages\create-dapp\templates\react-client-dapp
notepad.exe src\constants.ts
```
export const TESTNET_COUNTER_PACKAGE_ID = "0x1820092cf24d4fdac9b45e21e056c36608e1e327c14112f07e5f6a1989a829dc"
```
or:
echo export const TESTNET_COUNTER_PACKAGE_ID = "0x1820092cf24d4fdac9b45e21e056c36608e1e327c14112f07e5f6a1989a829dc" > src\constants.ts

pnpm add react-toastify
... add other
pnpm install
pnpm dev

# raw call:
sui client call --package 0x1820092cf24d4fdac9b45e21e056c36608e1e327c14112f07e5f6a1989a829dc --module sui_counter --function create 
sui client call --package 0x1820092cf24d4fdac9b45e21e056c36608e1e327c14112f07e5f6a1989a829dc --module sui_counter --function increment --args 0xa09e0483cd80e7955365cb0ea3733dd5821b7fe3ae0d66d964448d12d347978d