const ethers = require("ethers");
require("dotenv").config();
const RPC_URL = process.env.RPC_URL;
const PRIV = process.env.PRIVATE_KEY;
import {
  UV3_SWAPROUTER_ABI,
  UV3_SWAPROUTER_ADDRESS,
  UV_NFPM_ABI,
  UV_NFPM_ADDRESS,
} from "../constants";

const provider = new ethers.JsonRpcProvider(RPC_URL);
const signer = new ethers.Wallet(PRIV, provider);

const contract = async function exactSingleInputSwap() {};
