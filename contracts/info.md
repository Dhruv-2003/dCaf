https://app.gelato.network/task/0xa259ec3c140b1d3b7a8e0b5854f67e30d67bf8b3e1bed405433222097d49262f?chainId=80001
https://app.gelato.network/task/0xae12df4f8282f2305e32dbeb395a305c7e82923890cfa568d3cbf8c7d9c3be92?chainId=80001
https://mumbai.polygonscan.com/tx/0x51aa165defc21a85e79421c9e307a4e20f3f4c408a9c456fcd5dc8836c0d43a5#eventlog
https://mumbai.polygonscan.com/tx/0xfd96aba3e3897c1c1b6cfe7839b83ba6c3a22afaacd47df85ddcbe9c095b63c0
https://dashboard.tenderly.co/tx/mumbai/0xfd96aba3e3897c1c1b6cfe7839b83ba6c3a22afaacd47df85ddcbe9c095b63c0?trace=0.6.0
https://superfluidhq.notion.site/Setting-Up-Superfluid-Auto-Wrap-9a565d53bbee4bdc953cc2a656c43761

// executeTask1
https://mumbai.polygonscan.com/tx/0xc83a8d2932c70b034c76044f41799f8e54403def5e45fce8ab6fc4e466fd4774

// cancel task
https://mumbai.polygonscan.com/tx/0xfd96aba3e3897c1c1b6cfe7839b83ba6c3a22afaacd47df85ddcbe9c095b63c0

## Final

createDCA
https://mumbai.polygonscan.com/tx/0x7ef695c1f18da17a90522f64d6872fb2eb7b15e37f6bd6b1dad6ef418befdb6e
executeTask1
https://mumbai.polygonscan.com/tx/0x0230a336dcb27b7cf1d8cd4e2c1e42b59dbfa9bf0704a69e41228b7245b63312
executeTask2
https://mumbai.polygonscan.com/tx/0x4e9e78ea4c2460e23f66492b28e7ce938f401e67aabda371c60af992c1052089

https://app.gelato.network/task/0xaa46c2ec6bad35ce53be6aa6797a56dffdd59302a9d8030ae8a13f64396ad0c5?chainId=80001
https://app.gelato.network/task/0x6b9ed087546d67c3db700db4977f711223f52652921e3cae1abefd822aaa1baf?chainId=80001

##Checklist

- https://mumbai.polygonscan.com/address/0xcfA132E353cB4E398080B9700609bb008eceB125#writeContract

## What do we do ??

We have created a DEFI investement platform with Dollar cost Averaging Startegy to streamline investing peacefully on autmoation. This platform is for all the Degens who want to invest in an asset , but don't have the time and power to balance their portfolio at instances.

## What is Dollar Cost averaging ?

Dollar Cost averaging is an investement strategy where the user buys an asset at certain time intervals to reduce risks , the assets is bought at different prices in small amounts to average the out the price of the assets over a long time period which help them invest in the asset at a good average price. This removes the hassle of constantly checking the price and buying the assets , facing FOMO for not buying when the asset is at the lowest. Funds are not to be transferred at a single moment, they are streamed every second from your account directly to your portfolio, so little to no Risk of losing the funds.

## How our platform helps ?

Our Platform streamlines the process with just 1 click , Create a DCAOrder , Stream your assets with Superfluid into your personal wallet , and put your investing portfolio on auto pilot with Gelato. We handle everything from creating the stream right away to fulfilling your trade on time and completing the order at the End Date. The order can be cancelled at any point of time if needed to , only by you.

## What happend in the backend ??

In the backend , the superTokens are streamed into a freshly created dcaWallet , which will then create Gelato automation task to execute your order at the dcaFreq time you choose and the assets are unwrapped and swapped with the token you want to buy on uniswap under the hood , which will then be transferred back to your wallet. On the end of the order trade , the stream is cancelled , the remaining assets are returned and tasks are cancelled , to close your dcaOrder.

This was a quite a Unique and learning experience for us and we also faced a lot of challenges. We learned a lot about the Detailed concepts of investment strategies

### Challenge 1

Was to create the actual architectue of how everything would work in the backend , for which we put a lot of time in creating the actual flow of everything and how backend would work with Superfluid and Gelato
