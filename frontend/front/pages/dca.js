import React, { useState, useEffect } from "react";
import { Select, Stack } from "@chakra-ui/react";
import {
  dcafProtocol_ABI,
  dcafWallet_ABI,
  wmatic_ABI,
  wmaticx_ABI,
} from "../constants/abi";
import {
  WMATIC_Address,
  WMATICx_Address,
  dcafProtocol_Address,
} from "../constants/contracts";
import { useAccount, useWalletClient, usePublicClient } from "wagmi";
import { getContract } from "wagmi/actions";
import { Framework, SuperToken } from "@superfluid-finance/sdk-core";
import { parseEther } from "viem";

const Dca = () => {
  const [maticValue, setMaticValue] = useState();
  const [amountToUpgrade, setAmountToUpgrade] = useState();
  const [superTokenAdd, setSuperTokenAdd] = useState();
  const [tokenOut, setTokenOut] = useState();
  const [tokenIn, setTokenIn] = useState();
  const [flowRate, setFlowRate] = useState(); // converted into wei/sec
  const [totalTimePeriod, setTotalTimePeriod] = useState(); // converted into secs from start to end
  const [dcaFreq, setDcaFreq] = useState(); // converted into secs from hours and days
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const dcafProtocolContract = getContract({
    address: dcafProtocol_Address,
    abi: dcafProtocol_ABI,
    publicClient,
    walletClient,
  });

  const dcaf_contract = {
    address: dcafProtocol_Address,
    abi: dcafProtocol_ABI,
  };

  const wrapMatic = async () => {
    try {
      if (!maticValue) {
        console.log("Enter the matic value");
        return;
      }

      const { request } = await publicClient.simulateContract({
        address: WMATIC_Address,
        abi: wmatic_ABI,
        functionName: "deposit",
        account: address,
        value: parseEther(maticValue),
      });
      const tx = await walletClient.writeContract(request);
      console.log(tx);
    } catch (error) {
      console.log(error);
    }
  };

  const approveTokenUse = async () => {
    try {
      if (!amountToUpgrade) {
        console.log("WMATIC amount tot upgrade is missing");
        return;
      }

      const { request } = await publicClient.simulateContract({
        address: WMATIC_Address,
        abi: wmatic_ABI,
        functionName: "approve",
        account: address,
        args: [WMATICx_Address, parseEther(amountToUpgrade)],
      });
      const tx = await walletClient.writeContract(request);
      console.log(tx);
    } catch (error) {
      console.log(error);
    }
  };

  const upgrade = async () => {
    try {
      if (!amountToUpgrade) {
        console.log("Enter the amount to upgrade");
        return;
      }

      const approvedAmount = await publicClient.readContract({
        address: WMATIC_Address,
        abi: wmatic_ABI,
        functionName: "allowance",
        args: [address, WMATICx_Address],
      });

      if (approvedAmount >= parseEther(amountToUpgrade)) {
        console.log("Please approve the token usage first");
        return;
      }

      // const config = {
      //   hostAddress: "0xEB796bdb90fFA0f28255275e16936D25d3418603",
      //   cfaV1Address: "0x49e565Ed1bdc17F3d220f72DF0857C26FA83F873",
      //   idaV1Address: "0x804348D4960a61f2d5F9ce9103027A3E849E09b8",
      // };

      // const wmaticx = await SuperToken.create({
      //   address: WMATICx_Address,
      //   config,
      //   networkName: "maticmumbai", // you can also pass in chainId instead (e.g. chainId: 137)
      //   provider: publicClient,
      // });

      const { request } = await publicClient.simulateContract({
        address: WMATICx_Address,
        abi: wmaticx_ABI,
        functionName: "upgrade",
        account: address,
        args: [parseEther(amountToUpgrade)],
      });
      console.log("Upgrading the asset");
      const tx = await walletClient.writeContract(request);
      console.log(tx);
    } catch (error) {
      console.log(error);
    }
  };

  const approveOperator = async () => {
    try {
      if (!flowRate) {
        console.log("Enter Flow rate to be allowed");
        return;
      }
      const sf = await Framework.create({
        chainId: 80001, //i.e. 137 for matic
        provider: publicClient, // i.e. the provider being used
      });

      const wmaticx = await sf.loadSuperToken(WMATICx_Address);
      console.log(wmaticx);

      const updateFlowOperatorOperation = wmaticx.updateFlowOperatorPermissions(
        {
          flowOperator: dcafProtocol_Address,
          permissions: 7,
          flowRateAllowance: flowRate,
        }
      );
      console.log("Updating the flow operator permissions");
      const result = await updateFlowOperatorOperation.exec(walletClient);
      console.log(result);
    } catch (error) {
      console.log(error);
    }
  };

  const createDCAOrder = async () => {
    try {
      const { request } = await publicClient.simulateContract({
        ...dcaf_contract,
        functionName: "createDCA",
        args: [superTokenAdd, tokenOut, flowRate, totalTimePeriod, dcaFreq],
        account: address,
      });
      const tx = await walletClient.writeContract(request);
      console.log(tx);
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div className="w-full">
      <div className="flex justify-center items-center mx-auto ">
        <div className="mt-32">
          <div className="flex flex-col justify-center items-center mx-auto">
            <div className="px-10 py-3 border border-zinc-300 rounded-xl shadow-xl">
              <div className=" bg-green-200 text-green-700 px-2 py-0.5 rounded-xl">
                <p>Send stream</p>
              </div>
              <div className="flex flex-col justify-start">
                <div className="mt-6">
                  <p className="text-2xl">Flow rate</p>
                  <div className="flex mt-2 align-middle items-center">
                    <input
                      type="text"
                      placeholder="0.0"
                      className="focus:border-green-500 px-2 py-2 w-full text-2xl border-slate-300"
                    ></input>
                    <Select
                      variant="filled"
                      placeholder=""
                      className="px-1 mx-3"
                    >
                      <option value="">/seconds</option>
                      <option value="">/minute</option>
                      <option value="">/hour</option>
                      <option value="">/days</option>
                      <option value="">/months</option>
                    </Select>
                  </div>
                  <div className="flex flex-col mt-6">
                    <p className="text-2xl">Time Period</p>
                    <div className="flex align-middle items-center mt-2">
                      <input
                        type="number"
                        placeholder="0"
                        className="w-8 px-2 text-xl"
                      ></input>
                      <p className="mx-2 text-xl">days</p>
                      <input
                        type="number"
                        placeholder="0"
                        className="w-8 px-2 text-xl"
                      ></input>
                      <p className="mx-2 text-xl">hours</p>
                      <input
                        type="number"
                        placeholder="0"
                        className="w-8 px-2 text-xl"
                      ></input>
                      <p className="mx-2 text-xl">minutes</p>
                      <input
                        type="number"
                        placeholder="0"
                        className="w-8 px-2 text-xl"
                      ></input>
                      <p className="mx-2 text-xl">seconds</p>
                    </div>
                  </div>
                  <div className="flex flex-col mt-6">
                    <p className="text-2xl">DCA Frequency</p>
                    <div className="flex align-middle items-center mt-2">
                      <input
                        type="number"
                        placeholder="0"
                        className="w-8 px-2 text-xl"
                      ></input>
                      <p className="mx-2 text-xl">days</p>
                      <input
                        type="number"
                        placeholder="0"
                        className="w-8 px-2 text-xl"
                      ></input>
                      <p className="mx-2 text-xl">hours</p>
                      <input
                        type="number"
                        placeholder="0"
                        className="w-8 px-2 text-xl"
                      ></input>
                      <p className="mx-2 text-xl">minutes</p>
                      <input
                        type="number"
                        placeholder="0"
                        className="w-8 px-2 text-xl"
                      ></input>
                      <p className="mx-2 text-xl">seconds</p>
                    </div>
                  </div>
                  <div className="flex justify-center items-center mt-10">
                    <button className="bg-green-500 text-white px-10 py-3 rounded-xl text-lg hover:bg-white hover:text-green-500 hover:border hover:border-green-500">
                      Start stream
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dca;
