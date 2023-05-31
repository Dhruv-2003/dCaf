import React from "react";
import { useState } from "react";
import {
  cfav1forwarder_ABI,
  dcafProtocol_ABI,
  dcafWallet_ABI,
  wmatic_ABI,
  wmaticx_ABI,
} from "../constants/abi";
import {
  CFAV1Forwarder_Address,
  WETH_Address,
  WMATIC_Address,
  WMATICx_Address,
  dcafProtocol_Address,
} from "../constants/contracts";
import { useAccount, useWalletClient, usePublicClient } from "wagmi";
import { getContract } from "wagmi/actions";
import { parseEther } from "viem";

const Wrap = () => {
  const [approved, setApproved] = useState(false);
  const [maticValue, setMaticValue] = useState();
  const [amountToUpgrade, setAmountToUpgrade] = useState();
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

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
      window.alert(error);
    }
  };

  const approveTokenUse = async () => {
    try {
      if (!amountToUpgrade) {
        console.log("WMATIC amount to upgrade is missing");
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
      window.alert(error);
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
      console.log(approvedAmount);

      if (approvedAmount >= `${parseEther(amountToUpgrade)}n`) {
        console.log("Please approve the token usage first");
        return;
      }

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
      window.alert(error);
    }
  };

  return (
    <div className="w-full">
      <div className="flex justify-center items-center mx-auto ">
        <div className="mt-32">
          <div className="flex flex-col justify-center items-center mx-auto">
            <div className="px-10 py-3 border border-zinc-300 rounded-xl shadow-xl">
              <div className=" bg-green-200 text-green-700 px-2 py-0.5 rounded-xl w-16 -ml-2">
                <p>Wrap</p>
              </div>
              <div className="flex justify-start">
                <div className="mt-6">
                  <p className="text-2xl">Wrap</p>
                  <div className="flex mt-2 align-middle items-center">
                    <input
                      type="number"
                      placeholder="0.0 (in matic)"
                      onChange={(e) => {
                        setMaticValue(e.target.value);
                      }}
                      className="focus:border-green-500 px-2 py-2 w-full text-2xl border-slate-300"
                    ></input>
                  </div>
                </div>
                <div className="mt-6 mx-6">
                  <p className="text-2xl">Upgrade</p>
                  <div className="flex mt-2 align-middle items-center">
                    <input
                      type="number"
                      placeholder="0.0 (in matic)"
                      onChange={(e) => setAmountToUpgrade(e.target.value)}
                      className="focus:border-green-500 px-2 py-2 w-full text-2xl border-slate-300"
                    ></input>
                  </div>
                </div>
              </div>
              <div className="flex justify-between mt-10 mx-20">
                <button
                  onClick={() => wrapMatic()}
                  className={`bg-blue-400 text-white px-10 py-3 rounded-xl text-lg cursor-pointer hover:bg-white hover:text-blue-500 hover:border hover:border-blue-500 duration-200`}
                >
                  Wrap
                </button>
                {approved ? (
                  <button
                    onClick={() => upgrade()}
                    className="bg-green-500 text-white px-10 py-3 rounded-xl text-lg hover:bg-white hover:text-green-500 hover:border hover:border-green-500 duration-200"
                  >
                    Upgrade
                  </button>
                ) : (
                  <button
                    onClick={() => approveTokenUse()}
                    className="bg-green-500 text-white px-10 py-3 rounded-xl text-lg hover:bg-white hover:text-green-500 hover:border hover:border-green-500 duration-200"
                  >
                    Approve
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wrap;
