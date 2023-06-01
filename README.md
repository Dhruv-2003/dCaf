# dCaf

Automated Asset Investing Protocol with Dollar Cost Averaging strategy

DevFolio link - https://devfolio.co/projects/dcaf-4e51

Video link - https://youtu.be/D7kVdK--qY0

Created for the Superfolio May Wavepool

## Introduction

We have created a DEFI investement platform with Dollar cost Averaging Startegy to streamline investing peacefully on autmoation. This platform is for all the Degens who want to invest in an asset , but don't have the time and power to balance their portfolio at instances.
Our Platform streamlines the process with just 1 click , Create a DCAOrder , Stream your assets with Superfluid into your personal wallet , and put your investing portfolio on auto pilot with Gelato. We handle everything from creating the stream right away to fulfilling your trade on time and completing the order at the End Date. The order can be cancelled at any point of time if needed to , only by you.

## How does it Work?

Here's a Flowchart to understand easily

![dCaf (3)](https://github.com/Dhruv-2003/dCaf/assets/91938348/2a246d47-0256-4eb6-9f6c-687575bc24f6)

## Why is it useful?

Our Platform streamlines the process with just 1 click , Create a DCAOrder , Stream your assets with Superfluid into your personal wallet , and put your investing portfolio on auto pilot with Gelato. We handle everything from creating the stream right away to fulfilling your trade on time and completing the order at the End Date. The order can be cancelled at any point of time if needed to , only by you.

## Proof Of Work

### Transactions successfully done

### Create DCA Order

https://mumbai.polygonscan.com/tx/0xd96f2d29faf0818465c9f910cec41eae7096bf50baf5ae0be07a53726f12ed9e

### Stream

https://app.superfluid.finance/stream/polygon-mumbai/0x62c43323447899acb61c18181e34168903e033bf-0xdf1a91a6662d1cfa9eb3d494a10383a880c32e4f-0xf9c9a7271468e719604ceaef0fbb0d98007bf4fc-0.0

### Gelato

#### Task1

https://app.gelato.network/task/0xba170cea0c62ed36ece3ab8253bfc9a4ac24f38263a1856b251bd68282b6b7fe?chainId=80001

#### Task2

https://app.gelato.network/task/0xc079f59862d4999bc1909ac4915a2d731885582e9ce33d1d400909916d337af1?chainId=80001

### Gelato Tasks Execution

https://mumbai.polygonscan.com/tx/0xe9d68acd5d57c7990b94bd0ff0cbc23713d795ed64b2cff0583267b34aaa78ab
https://mumbai.polygonscan.com/tx/0xe9d68acd5d57c7990b94bd0ff0cbc23713d795ed64b2cff0583267b34aaa78ab

![dcaf]()(https://youtu.be/D7kVdK--qY0)

![WhatsApp Image 2023-05-31 at 9 33 09 PM (3)](https://github.com/Dhruv-2003/dCaf/assets/90101251/4af05f35-ed2e-4772-92d8-5cecb4b17060)

## Technologies Used

### Superfluid

Superfluid is used to stream the funds from user contract to the newly created DCAWallet directly. This ensures the funds are not sent at a sinlge point , avoiding the risk of losing the funds. They are streamed directly , under the hood , using the SuperldFluid contracts , ISupertoken and SuperTokenLibrary. We use Constant flow agreements , Access Control list and Super tokens to provide the functionality of controlling the streams for our dcaManager as an operator

### Gelato

We use Gelato Automate to handle all the contract automation , which is responsible for executing the swap transaction on Uniswap , at a fixed dcaFreq from time to time using time and proxy and module. The other task is responsible for closing the order on the end Date & time , cancel the streams , and also the task1, only executed single time. Gelato Automate Task creator was used to handle all these functionalities directlty from the contracts

### Uniswap

UniswapV3 is used to swap the assets in the contract directly , we use the ISwapper to initiate the swap with the uniswap pools .For this hackathon we used the WMATIC / WETH pair currently to test out and for demo . The calculations are done by the uniswap itself , we use `exactInputTokenSingle` method currently.

## Team

- [@dhruv-2003](https://github.com/Dhruv-2003)
- [@ArchitSharma7](https://github.com/Architsharma7)
