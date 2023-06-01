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

<img width="467" alt="Screenshot 2023-05-31 at 10 40 49 PM" src="https://github.com/Dhruv-2003/dCaf/assets/90101251/38b8809f-5a9d-4353-b5fa-0881dfd14443">

## Why is it useful?

Our Platform streamlines the process with just 1 click , Create a DCAOrder , Stream your assets with Superfluid into your personal wallet , and put your investing portfolio on auto pilot with Gelato. We handle everything from creating the stream right away to fulfilling your trade on time and completing the order at the End Date. The order can be cancelled at any point of time if needed to , only by you.

## Proof Of Work

### Transactions successfully done

### Create DCA Order

https://mumbai.polygonscan.com/tx/0x7ef695c1f18da17a90522f64d6872fb2eb7b15e37f6bd6b1dad6ef418befdb6e

### Stream

https://app.superfluid.finance/stream/polygon-mumbai/0x62C43323447899acb61C18181e34168903E033Bf-0xdF1a91A6662d1CFA9eb3d494A10383a880c32E4F-0xf9c9a7271468e719604ceaef0fbb0d98007bf4fc-0.0

### Gelato

#### Task1

https://app.gelato.network/task/0xaa46c2ec6bad35ce53be6aa6797a56dffdd59302a9d8030ae8a13f64396ad0c5?chainId=80001

#### Task2

https://app.gelato.network/task/0x6b9ed087546d67c3db700db4977f711223f52652921e3cae1abefd822aaa1baf?chainId=8000

### Task execution

https://mumbai.polygonscan.com/tx/0xed8d4e8931e816745a446230ef2a525b45124f71d15de7fe9d2812f19ce47cf8

### Gelato Tasks Execution

https://mumbai.polygonscan.com/tx/0x0230a336dcb27b7cf1d8cd4e2c1e42b59dbfa9bf0704a69e41228b7245b63312
https://mumbai.polygonscan.com/tx/0x4e9e78ea4c2460e23f66492b28e7ce938f401e67aabda371c60af992c1052089

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
