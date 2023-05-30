import { ethers } from "ethers";
import { Framework, SuperToken } from "@superfluid-finance/sdk-core";
// require("dotenv").config();
const RPC_URL = "";
const PRIV = "";
import { WMATICx_ABI, WMATICx_ADDRESS } from "../constants.js";
const provider = new ethers.providers.AlchemyProvider("maticmum", RPC_URL);
const signer = new ethers.Wallet(PRIV, provider);

const contract = new ethers.Contract(WMATICx_ADDRESS, WMATICx_ABI, signer);

async function upgrade() {
  console.log("Wrapping and upgrading ...");

  const amount = ethers.utils.parseEther("0.2");
  const tx = await contract.upgrade(amount);
  await tx.wait();

  console.log(tx);
  //   const name = await contract.name();
  //   console.log(name);
}

upgrade();
// const config = {
//   hostAddress: "0xEB796bdb90fFA0f28255275e16936D25d3418603",
//   cfaV1Address: "0x49e565Ed1bdc17F3d220f72DF0857C26FA83F873",
//   idaV1Address: "0x804348D4960a61f2d5F9ce9103027A3E849E09b8",
// };

// const sf = await Framework.create({
//   chainId: 80001,
//   provider,
// });

// const wmaticx = await sf.loadSuperToken(
//   "0xF9c9a7271468e719604CeAEF0fBb0d98007bF4FC"
// );

// // const wmaticx = await SuperToken.create({
// //   address: "0x5D8B4C2554aeB7e86F387B4d6c00Ac33499Ed01f",
// //   config,
// //   chainId: 80001, // you can also pass in chainId instead (e.g. chainId: 137)
// //   provider,
// // });
// async function upgardeSDK() {
//   const name = await wmaticx.name();
//   console.log(name);
// }

// upgardeSDK();
